/* ==========================================
   健身计划 App — 农历（阴阳历）转换模块
   支持 1900-2100 年太阳能→农历转换
   全局对象: LunarModule
   ========================================== */

const LunarModule = (() => {
  'use strict';

  // ---------- 农历数据（1900-2100，每年一个编码） ----------
  // 每个数字编码：
  //   低 4 位 (0x0000f)：闰月月份（0=无闰月）
  //   位 4-15 (0x0fff0)：12 个月的大小月（1=30天, 0=29天），从正月到腊月
  //   位 16-19：闰月天数（0=29天, 1=30天），无闰月则为0
  const LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2, // 1900-1909
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977, // 1910-1919
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970, // 1920-1929
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950, // 1930-1939
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557, // 1940-1949
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0, // 1950-1959
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0, // 1960-1969
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6, // 1970-1979
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570, // 1980-1989
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0, // 1990-1999
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5, // 2000-2009
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930, // 2010-2019
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530, // 2020-2029
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45, // 2030-2039
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0, // 2040-2049
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0, // 2050-2059
    0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4, // 2060-2069
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0, // 2070-2079
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160, // 2080-2089
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252, // 2090-2099
    0x0d520  // 2100
  ];

  // ---------- 天干地支 / 生肖 ----------
  const STEMS  = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const ANIMALS  = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];

  // 农历月份名称
  const MONTH_NAMES = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
  // 农历日期名称
  const DAY_NAMES = [
    '','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
  ];

  // 公历每月天数
  const SOLAR_MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];

  // ---------- 基础查询 ----------

  /** 获取农历年信息：{ yearDays, leapMonth, leapDays, monthDays[] } */
  function getLunarYearInfo(lunarYear) {
    const info = LUNAR_INFO[lunarYear - 1900];
    if (info === undefined) return null;

    const leapMonth = info & 0xf;           // 闰月月份 (0=无)
    const leapDays = leapMonth ? ((info >> 16) & 0x1) ? 30 : 29 : 0;

    // 12个月的大小
    const monthDays = [];
    for (let i = 0; i < 12; i++) {
      monthDays.push((info >> (4 + i)) & 0x1 ? 30 : 29);
    }

    // 计算农历年总天数
    let yearDays = 0;
    for (let i = 0; i < 12; i++) yearDays += monthDays[i];
    if (leapMonth) yearDays += leapDays;

    return { yearDays, leapMonth, leapDays, monthDays };
  }

  /** 判断公历是否为闰年 */
  function isSolarLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /** 获取公历月的天数 */
  function getSolarMonthDays(year, month) { // month 0-11
    if (month === 1) return isSolarLeap(year) ? 29 : 28;
    return SOLAR_MONTH_DAYS[month];
  }

  // ---------- 核心转换 ----------

  /**
   * 公历日期 → 农历日期
   * @param {string} dateStr - "YYYY-MM-DD"
   * @returns {{ year:number, month:number, day:number, isLeap:boolean,
   *             yearName:string, monthName:string, dayName:string,
   *             animal:string, stemBranch:string }}
   */
  function solarToLunar(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const solarDate = new Date(y, m - 1, d);

    // 计算从 1900-01-31（农历庚子年正月初一）到目标日期的天数差
    const baseDate = new Date(1900, 0, 31);
    let offset = Math.floor((solarDate - baseDate) / (1000 * 60 * 60 * 24));

    // 逐个农历年减去天数
    let lunarYear, lunarMonth, lunarDay, isLeap;
    for (lunarYear = 1900; lunarYear <= 2100 && offset > 0; lunarYear++) {
      const info = getLunarYearInfo(lunarYear);
      if (!info) break;
      if (offset < info.yearDays) break;
      offset -= info.yearDays;
    }

    if (lunarYear > 2100) {
      // 超出范围，返回公历信息
      const stemIdx = (y - 4) % 10;
      const branchIdx = (y - 4) % 12;
      return {
        year: y, month: m, day: d, isLeap: false,
        yearName: `${STEMS[stemIdx >= 0 ? stemIdx : stemIdx + 10]}${BRANCHES[branchIdx >= 0 ? branchIdx : branchIdx + 12]}年`,
        monthName: `${m}月`, dayName: `${d}日`,
        animal: ANIMALS[branchIdx >= 0 ? branchIdx : branchIdx + 12],
        stemBranch: `${STEMS[stemIdx >= 0 ? stemIdx : stemIdx + 10]}${BRANCHES[branchIdx >= 0 ? branchIdx : branchIdx + 12]}`
      };
    }

    const lunarInfo = getLunarYearInfo(lunarYear);
    isLeap = false;

    // 在农历年内确定月份和日期
    for (lunarMonth = 1; lunarMonth <= 12; lunarMonth++) {
      let monthDays = lunarInfo.monthDays[lunarMonth - 1];

      if (offset < monthDays) {
        lunarDay = offset + 1;
        break;
      }
      offset -= monthDays;

      // 检查闰月
      if (lunarInfo.leapMonth === lunarMonth) {
        if (offset < lunarInfo.leapDays) {
          isLeap = true;
          lunarDay = offset + 1;
          break;
        }
        offset -= lunarInfo.leapDays;
      }
    }

    // 构建显示名称
    const stemIdx = (lunarYear - 4) % 10;
    const branchIdx = (lunarYear - 4) % 12;
    const s = stemIdx >= 0 ? stemIdx : stemIdx + 10;
    const b = branchIdx >= 0 ? branchIdx : branchIdx + 10;
    const yearName = `${STEMS[s]}${BRANCHES[b]}年`;
    const monthPrefix = isLeap ? '闰' : '';
    const monthName = `${monthPrefix}${MONTH_NAMES[lunarMonth - 1]}月`;
    const dayName = DAY_NAMES[lunarDay];

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap,
      yearName,
      monthName,
      dayName,
      animal: ANIMALS[b],
      stemBranch: `${STEMS[s]}${BRANCHES[b]}`
    };
  }

  // ---------- 公开 API ----------
  return {
    solarToLunar,
  };
})();

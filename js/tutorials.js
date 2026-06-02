/* ==========================================
   健身计划 App — 教程模块
   内置17个健身动作的图文教程 + 视频跳转
   全局对象: TutorialsModule
   ========================================== */

'use strict';

const TutorialsModule = (() => {

  // ---------- 17个动作教程数据 ----------
  const TUTORIALS = [
    // ==================== 有氧训练 ====================
    {
      id: 'running', name: '跑步', emoji: '\u{1F3C3}', difficulty: '初级',
      targetMuscles: '股四头肌、腘绳肌、小腿肌群、核心肌群',
      description: '跑步是最基础、最有效的有氧运动之一，能提升心肺功能、燃烧脂肪、增强下肢力量。适合所有健身水平的人群。',
      steps: [
        { num: 1, title: '热身准备', detail: '先进行5-10分钟动态拉伸：高抬腿、后踢腿、开合跳。活动脚踝、膝盖、髋关节，提高身体温度。' },
        { num: 2, title: '正确姿势', detail: '身体微微前倾，头部保持中立，目视前方。肩部放松，手臂以90度角前后摆动，不要左右横摆。' },
        { num: 3, title: '落地技巧', detail: '以前脚掌或全脚掌着地，不要用脚后跟重砸地面。步幅适中，落地点在身体重心正下方。' },
        { num: 4, title: '呼吸节奏', detail: '采用"两步一吸、两步一呼"的节奏。用鼻子吸气、嘴巴呼气，保持呼吸均匀深长。' },
        { num: 5, title: '冷却拉伸', detail: '跑完后不要立即停下，慢走3-5分钟让心率逐渐恢复。然后静态拉伸大腿前后侧和小腿各30秒。' },
      ],
      keyPoints: [
        '保持核心收紧，避免腰部塌陷或过度后仰',
        '落地时膝盖微屈，利用肌肉缓冲而非关节硬撑',
        '步频建议保持在170-180步/分钟，减小步幅降低冲击',
        '手臂摆动方向应是前后而非左右，避免浪费能量',
        '每周跑步3-4次，每次30-45分钟效果最佳',
      ],
      commonMistakes: [
        { mistake: '步幅过大，脚后跟着地', correction: '减小步幅，增加步频至170-180步/分钟，以前脚掌着地' },
        { mistake: '身体过度后仰或前倾', correction: '保持身体略微前倾5-10度，收紧核心维持稳定' },
        { mistake: '手臂左右横摆', correction: '手臂应沿身体两侧前后摆动，手肘保持约90度角' },
      ],
      imageHint: '搜索关键词：跑步标准姿势图解 / running form guide',
      videoLinks: [
        {
          platform: 'B站', icon: '\u{1F4FA}',
          url: 'bilibili://search?keyword=跑步正确姿势教程',
          webFallback: 'https://search.bilibili.com/all?keyword=跑步正确姿势教程',
        },
        {
          platform: '抖音', icon: '\u{1F3B5}',
          url: 'snssdk1128://search?keyword=跑步教程',
          webFallback: 'https://www.douyin.com/search/跑步标准动作教程',
        },
      ],
    },
    {
      id: 'jump-rope', name: '跳绳', emoji: '\u{1FA62}', difficulty: '中级',
      targetMuscles: '小腿肌群、核心肌群、肩部、协调性',
      description: '跳绳是燃脂效率极高的有氧运动，10分钟跳绳约等于30分钟慢跑。同时能提升手脚协调能力和节奏感。',
      steps: [
        { num: 1, title: '选绳调长', detail: '双脚踩住绳子中间，手柄应到达腋窝高度。绳子过长会绊脚，过短需要弯腰跳。' },
        { num: 2, title: '基本姿势', detail: '双手握住手柄，肘部贴近身体两侧，前臂外展。身体直立，核心收紧，目视前方。' },
        { num: 3, title: '手腕发力', detail: '用手腕旋转绳子，而非整个手臂。上臂保持相对固定，手腕做小幅度圆周运动。' },
        { num: 4, title: '弹跳技巧', detail: '用前脚掌弹跳，脚后跟不落地。跳跃高度仅需2-4厘米，刚好让绳子通过即可。膝盖微屈缓冲。' },
      ],
      keyPoints: [
        '跳跃高度控制在2-4厘米，越低越省力',
        '手腕发力旋转绳子，而非手臂大幅度甩动',
        '落地时前脚掌先着地，膝盖自然弯曲缓冲',
        '保持核心收紧，身体直立不要弯腰驼背',
        '初学者从每组1分钟开始，逐渐增加到3-5分钟',
      ],
      commonMistakes: [
        { mistake: '跳得太高，浪费体力', correction: '只需跳起2-4厘米让绳子通过，想象踮脚尖的高度' },
        { mistake: '手臂张得太开', correction: '肘部紧贴身体两侧，仅用手腕旋转绳子' },
        { mistake: '双脚落地太重', correction: '以前脚掌轻落地，想象在热地板上跳跃' },
      ],
      imageHint: '搜索关键词：跳绳标准动作 / jump rope technique',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=跳绳入门教程', webFallback: 'https://search.bilibili.com/all?keyword=跳绳入门教程' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=跳绳教程', webFallback: 'https://www.douyin.com/search/跳绳标准动作教程' },
      ],
    },
    {
      id: 'treadmill', name: '爬坡', emoji: '\u{1F3D4}', difficulty: '中级',
      targetMuscles: '臀大肌、股四头肌、腘绳肌、核心肌群',
      description: '跑步机爬坡是高效的臀腿训练，相比平地跑步对膝盖冲击更小，同时能更好地激活臀部肌群。',
      steps: [
        { num: 1, title: '设置参数', detail: '坡度建议8-12度，速度4-6km/h。新手从坡度8、速度4开始，逐渐适应后增加。' },
        { num: 2, title: '身体姿势', detail: '身体微微前倾与坡度匹配，不要后仰。收紧核心，不要手扶扶手（除非平衡需要）。' },
        { num: 3, title: '步幅控制', detail: '爬坡时步幅比平地稍短，步频稍慢。每一步用力蹬地，感受臀部发力推动身体。' },
        { num: 4, title: '手臂配合', detail: '手臂自然摆动提供动力，幅度比平地跑步略大。保持肩膀放松不要耸肩。' },
      ],
      keyPoints: [
        '全程不要手扶扶手，否则降低训练效果50%以上',
        '用臀部发力蹬地，而不是单纯用大腿抬腿',
        '身体前倾角度应与坡度一致，保持身体与地面垂直',
        '每次20-30分钟，燃脂效果最佳',
      ],
      commonMistakes: [
        { mistake: '手扶扶手走路', correction: '放开扶手，降低速度或坡度，让身体自主平衡' },
        { mistake: '身体后仰', correction: '身体前倾与坡度一致，核心收紧，感受臀部发力' },
        { mistake: '步幅太大', correction: '爬坡时步幅应比平地短10-15%，增加步频代替步幅' },
      ],
      imageHint: '搜索关键词：跑步机爬坡正确姿势 / treadmill incline walk',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=跑步机爬坡教程', webFallback: 'https://search.bilibili.com/all?keyword=跑步机爬坡教程' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=爬坡教程', webFallback: 'https://www.douyin.com/search/跑步机爬坡正确姿势' },
      ],
    },
    {
      id: 'stair-climber', name: '爬楼', emoji: '\u{1FAA1}', difficulty: '中级',
      targetMuscles: '股四头肌、臀大肌、小腿肌群、核心',
      description: '爬楼梯是一项极佳的下肢力量+有氧结合运动。每天爬楼10分钟，相当于慢跑20分钟的消耗量，还能塑造翘臀。',
      steps: [
        { num: 1, title: '选好楼梯', detail: '选择有扶手的楼梯，每级台阶高度一致。避免过陡或不规则的楼梯。运动鞋减震很重要。' },
        { num: 2, title: '正确姿势', detail: '身体微前倾，全脚掌踩实每级台阶。用臀部和大腿发力上推，不要用小跳的方式。' },
        { num: 3, title: '节奏控制', detail: '保持匀速上楼，不要冲太快。每一步踩稳后再迈下一步。配合呼吸：上台阶时呼气。' },
        { num: 4, title: '下楼技巧', detail: '下楼时膝盖承受3倍体重冲击，务必慢速、全脚掌着地。建议乘电梯下楼以减少膝盖负担。' },
      ],
      keyPoints: [
        '上楼梯时全脚掌踩实，不要只用前脚掌',
        '臀部发力推动身体，感受臀大肌收缩',
        '建议只上不下——上楼训练，乘电梯下楼保护膝盖',
        '每次15-20分钟，每周3-4次',
      ],
      commonMistakes: [
        { mistake: '下楼时跑跳', correction: '下楼应慢走或乘电梯，减少膝盖冲击' },
        { mistake: '踮脚上楼', correction: '全脚掌踩实台阶，用臀腿力量推动而非小腿弹跳' },
        { mistake: '弯腰驼背', correction: '保持挺胸收腹，目视前方台阶' },
      ],
      imageHint: '搜索关键词：爬楼梯锻炼正确方法 / stair climbing workout',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=爬楼梯减脂教程', webFallback: 'https://search.bilibili.com/all?keyword=爬楼梯减脂教程' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=爬楼减肥', webFallback: 'https://www.douyin.com/search/爬楼梯减肥正确方法' },
      ],
    },

    // ==================== 腿部训练 ====================
    {
      id: 'squat', name: '深蹲', emoji: '\u{1F3CB}', difficulty: '初级',
      targetMuscles: '股四头肌、臀大肌、腘绳肌、核心肌群',
      description: '深蹲被称为"力量训练之王"，是最基础的下肢复合动作。正确深蹲能增强腿臀力量、改善体态、提高代谢率。',
      steps: [
        { num: 1, title: '起始站姿', detail: '双脚与肩同宽或略宽，脚尖微微外八（约15-30度）。挺胸收腹，核心收紧，目视前方。' },
        { num: 2, title: '下蹲动作', detail: '臀部向后下方坐，像坐椅子一样。膝盖与脚尖方向一致。下蹲至大腿与地面平行或更低。全程保持腰背挺直。' },
        { num: 3, title: '底部停留', detail: '到达最低点时保持1秒，确认膝盖不超过脚尖过多，重心在脚掌中部。感受臀腿发力。' },
        { num: 4, title: '站起还原', detail: '用脚后跟发力蹬地，臀部收紧推动身体站起。全程保持核心收紧，不要弓背。呼气站起。' },
      ],
      keyPoints: [
        '膝盖方向始终与脚尖一致，不要内扣',
        '腰背始终保持挺直，不要弯腰弓背',
        '重心放在脚掌中部至脚后跟，脚尖可以轻微上翘检查',
        '下蹲深度：至少大腿平行地面，柔韧性好可更深',
        '初学者从自重开始，每组15-20次，3-4组',
      ],
      commonMistakes: [
        { mistake: '膝盖内扣', correction: '有意识地将膝盖向外推，与脚尖保持一致方向' },
        { mistake: '弯腰弓背', correction: '收紧核心，挺胸，把注意力放在保持躯干直立上' },
        { mistake: '脚跟离地', correction: '重心后移，可以试着在脚后跟下垫小重量的杠铃片练习' },
      ],
      imageHint: '搜索关键词：深蹲标准姿势图解 / squat form guide',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=深蹲标准动作教学', webFallback: 'https://search.bilibili.com/all?keyword=深蹲标准动作教学' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=深蹲教程', webFallback: 'https://www.douyin.com/search/深蹲标准动作教程' },
      ],
    },
    {
      id: 'deadlift', name: '硬拉', emoji: '\u{1F3CB}', difficulty: '高级',
      targetMuscles: '腘绳肌、臀大肌、竖脊肌、斜方肌、前臂',
      description: '硬拉是三大力量举动作之一，几乎调动全身肌肉。正确硬拉能极大增强后链力量和核心稳定性，但技术要求高。',
      steps: [
        { num: 1, title: '站位准备', detail: '双脚与髋同宽，杠铃杆在脚掌中部正上方。小腿距离杠铃杆约2-3厘米。脚尖微外八。' },
        { num: 2, title: '握杠姿势', detail: '髋部后推，屈膝俯身，双手握杠（正握或正反握）。手臂伸直，肩部在杠铃杆前方。挺胸，腰背挺直。' },
        { num: 3, title: '发力拉起', detail: '脚后跟蹬地，同时伸膝伸髋。杠铃杆贴着小腿和大腿上升。全程保持杠铃杆贴近身体。' },
        { num: 4, title: '锁定顶峰', detail: '站直后臀部收紧前推，肩膀后拉。顶峰保持1秒，不要过度后仰。' },
        { num: 5, title: '下放还原', detail: '髋部后推，杠铃杆贴着大腿和小腿缓慢下放至地面。全程控制，不要直接松手。' },
      ],
      keyPoints: [
        '全程保持腰背挺直（中立位），这是最重要的安全原则',
        '杠铃杆全程贴着腿移动，不要远离身体',
        '发力时想象"用脚蹬地把地球推走"，而非用手臂拉',
        '核心全程收紧，像准备被人打肚子一样',
        '初学者建议从轻重量或壶铃硬拉开始学习动作模式',
      ],
      commonMistakes: [
        { mistake: '弯腰弓背（最危险）', correction: '减轻重量，收紧核心，挺胸，把注意力集中在保持脊柱中立' },
        { mistake: '杠铃杆远离身体', correction: '杠铃应全程贴着腿移动，可以穿长裤保护小腿' },
        { mistake: '用腰拉而非用腿蹬', correction: '想象脚蹬地的感觉，臀腿先发力，腰背只负责传导力量' },
      ],
      imageHint: '搜索关键词：硬拉标准姿势图解 / deadlift form guide',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=硬拉教学完整版', webFallback: 'https://search.bilibili.com/all?keyword=硬拉教学完整版' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=硬拉教程', webFallback: 'https://www.douyin.com/search/硬拉标准动作教程' },
      ],
    },

    // ==================== 胸部训练 ====================
    {
      id: 'bench-press', name: '卧推', emoji: '\u{1F3CB}', difficulty: '中级',
      targetMuscles: '胸大肌、三角肌前束、肱三头肌',
      description: '卧推是锻炼胸肌的王牌动作，也是三大力量举动作之一。能有效增厚胸肌、增强上肢推力和肩部稳定性。',
      steps: [
        { num: 1, title: '躺姿定位', detail: '仰卧在平板凳上，眼睛在杠铃杆正下方。双脚踩实地面。肩胛骨收紧向后夹，胸部挺起。' },
        { num: 2, title: '握距确定', detail: '双手握距约1.5倍肩宽。握距越宽越侧重胸肌外侧，越窄越侧重肱三头肌。手腕中立不要翻腕。' },
        { num: 3, title: '下放杠铃', detail: '吸气，控制杠铃缓慢下放至胸口下沿（乳头连线位置）。肘部与身体约成45-75度角，不要外展到90度。' },
        { num: 4, title: '推起杠铃', detail: '杠铃触胸后发力推起，感受胸肌收缩。推至手臂伸直但不锁死肘关节。呼气推起。' },
      ],
      keyPoints: [
        '肩胛骨全程收紧向后夹，这是保护肩关节的关键',
        '肘部不要外展到90度（与肩平齐），保持45-75度夹角',
        '杠铃下放至胸口下沿，不要放到锁骨或腹部',
        '脚踩实地，为身体提供稳定支点',
        '新手建议从史密斯机或哑铃卧推开始',
      ],
      commonMistakes: [
        { mistake: '肘部外展90度（伤肩）', correction: '肘部保持与身体成45-75度角，不要与肩膀齐平' },
        { mistake: '肩胛骨放松', correction: '全程收紧肩胛骨向后夹，想象用背部抵住凳子' },
        { mistake: '弹胸借力', correction: '杠铃应在胸口轻触后匀速推起，不要用胸口弹起杠铃' },
      ],
      imageHint: '搜索关键词：卧推标准姿势 / bench press form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=卧推教学详解', webFallback: 'https://search.bilibili.com/all?keyword=卧推教学详解' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=卧推教程', webFallback: 'https://www.douyin.com/search/卧推标准动作教程' },
      ],
    },
    {
      id: 'fly', name: '飞鸟', emoji: '\u{1F985}', difficulty: '中级',
      targetMuscles: '胸大肌（内侧+外侧）、肩部稳定性',
      description: '哑铃飞鸟是胸肌孤立训练的最佳动作之一，能有效拉伸和收缩胸肌，增加胸肌宽度和线条感。',
      steps: [
        { num: 1, title: '起始位置', detail: '仰卧在平板凳上，双手持哑铃举至胸口正上方，掌心相对。手臂微屈（肘关节约150度），不要完全伸直。' },
        { num: 2, title: '下放展开', detail: '吸气，保持手臂微屈角度不变，缓慢将哑铃向两侧展开。感受胸肌被拉伸。展开至胸口水平或略低。' },
        { num: 3, title: '收紧合拢', detail: '呼气，胸肌发力将哑铃沿弧线"抱"回起始位置。想象抱一棵大树。顶峰感受胸肌挤压1秒。' },
      ],
      keyPoints: [
        '手臂全程保持微屈角度不变，像"抱树"而非"推"',
        '下放时感受胸肌拉伸，不要追求过大的活动幅度',
        '哑铃不要下放太低（低于胸口水平），避免肩关节受力过大',
        '重量不要求太重，飞鸟是感受型动作，重在肌肉控制',
      ],
      commonMistakes: [
        { mistake: '手臂伸太直', correction: '保持手肘微屈约150度，全程角度不变' },
        { mistake: '哑铃下放太深', correction: '下放至胸口水平即可，更低会增加肩关节受伤风险' },
        { mistake: '用惯性甩', correction: '减轻重量，全程控制哑铃运动速度，做到慢下快上' },
      ],
      imageHint: '搜索关键词：哑铃飞鸟标准动作 / dumbbell fly form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=哑铃飞鸟教学', webFallback: 'https://search.bilibili.com/all?keyword=哑铃飞鸟教学' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=哑铃飞鸟', webFallback: 'https://www.douyin.com/search/哑铃飞鸟标准动作' },
      ],
    },
    {
      id: 'push-up', name: '俯卧撑', emoji: '\u{1F3CB}', difficulty: '初级',
      targetMuscles: '胸大肌、肱三头肌、三角肌前束、核心肌群',
      description: '俯卧撑是最经典的自重训练动作，随时随地可练。能全面锻炼上肢推力、核心稳定性和身体控制能力。',
      steps: [
        { num: 1, title: '准备姿势', detail: '双手略宽于肩，手掌在胸口正下方。身体从头到脚成一条直线，核心收紧，臀部不要塌也不要翘。' },
        { num: 2, title: '下放身体', detail: '吸气，弯曲手肘缓慢下放身体。肘部与身体成45度角。下放至胸口接近地面（约一拳距离）。' },
        { num: 3, title: '推起还原', detail: '呼气，胸部和手臂发力将身体推起。全程保持身体直线。推至手臂伸直但不锁死肘关节。' },
      ],
      keyPoints: [
        '身体全程保持一条直线（头-肩-臀-脚踝），核心收紧',
        '手肘与身体成45度角，不要外展到90度',
        '手掌在胸口正下方，不要放在脖子或腹部下方',
        '视线看向地面而非前方，保持颈椎中立',
        '做不了标准俯卧撑可以从跪姿俯卧撑或上斜俯卧撑开始',
      ],
      commonMistakes: [
        { mistake: '腰部塌陷或臀部翘起', correction: '收紧核心和臀部，想象身体是一块平板' },
        { mistake: '手肘张得太开', correction: '手肘保持与身体45度，感受胸肌发力而非肩部' },
        { mistake: '半程俯卧撑', correction: '下放至胸口离地一拳距离，推至手臂伸直，做完整幅度' },
      ],
      imageHint: '搜索关键词：俯卧撑标准姿势 / push up correct form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=俯卧撑正确姿势', webFallback: 'https://search.bilibili.com/all?keyword=俯卧撑正确姿势' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=俯卧撑教程', webFallback: 'https://www.douyin.com/search/俯卧撑标准动作' },
      ],
    },

    // ==================== 背部训练 ====================
    {
      id: 'row', name: '划船', emoji: '\u{1F6A3}', difficulty: '中级',
      targetMuscles: '背阔肌、菱形肌、斜方肌中下束、肱二头肌',
      description: '划船动作是打造V型背部的基础训练，能改善含胸驼背的体态问题。哑铃划船是最常用的单侧背部训练。',
      steps: [
        { num: 1, title: '支撑姿势', detail: '单腿跪在平板凳上，同侧手支撑。另一只脚站在地面。背部保持平直，核心收紧。' },
        { num: 2, title: '起始位置', detail: '持哑铃的手臂自然下垂，感受背阔肌被拉伸。肩部放松，不要耸肩。' },
        { num: 3, title: '拉起哑铃', detail: '背部发力，将哑铃沿弧线拉至髋部位置。肘部贴近身体，顶峰感受背部收缩1秒。' },
        { num: 4, title: '下放还原', detail: '控制哑铃缓慢下放，感受背部肌肉拉伸。全程保持身体稳定不晃动。' },
      ],
      keyPoints: [
        '用背部发力拉，而不是用手臂拉——想象肘部向后上方移动',
        '全程保持背部平直，不要弓背或扭动身体',
        '拉起时肩胛骨向脊柱中线收缩',
        '下放时控制速度，不要利用惯性',
      ],
      commonMistakes: [
        { mistake: '用手臂而非背部发力', correction: '想象用手肘画弧线，注意力集中在背部肌肉的收缩' },
        { mistake: '身体晃动借力', correction: '减轻重量，收紧核心，保持躯干稳定不动' },
        { mistake: '耸肩', correction: '全程保持肩膀下沉，远离耳朵' },
      ],
      imageHint: '搜索关键词：哑铃划船标准姿势 / dumbbell row form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=哑铃划船教学', webFallback: 'https://search.bilibili.com/all?keyword=哑铃划船教学' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=哑铃划船', webFallback: 'https://www.douyin.com/search/哑铃划船标准动作' },
      ],
    },
    {
      id: 'pull-up', name: '引体向上', emoji: '\u{1F3CB}', difficulty: '高级',
      targetMuscles: '背阔肌、大圆肌、肱二头肌、前臂肌群',
      description: '引体向上是上肢拉力训练的王者动作，也是衡量上肢相对力量的金标准。能打造宽厚的背部和强壮的手臂。',
      steps: [
        { num: 1, title: '握杠悬挂', detail: '双手略宽于肩握住单杠（正手握），手臂伸直悬挂。肩胛骨下沉，不要耸肩。核心收紧，双腿可交叉。' },
        { num: 2, title: '发力上拉', detail: '背部发力，将身体向上拉。想象肘部向下后方拉。下巴过杠为完成一次。全程身体不要大幅度晃动。' },
        { num: 3, title: '顶峰收缩', detail: '下巴过杠后保持1秒，感受背阔肌完全收缩。头部不要过度前伸。' },
        { num: 4, title: '下放还原', detail: '控制身体缓慢下放至手臂伸直，但不要完全放松肩部。感受背部肌肉拉伸。' },
      ],
      keyPoints: [
        '肩胛骨先下沉再发力拉，不要直接用手臂硬拉',
        '全程身体不要晃动借力（除非做借力引体）',
        '上拉时挺胸，让锁骨靠近单杠',
        '做不了标准引体可以从：悬挂练习→离心下放→弹力带辅助→标准引体',
      ],
      commonMistakes: [
        { mistake: '摆动借力', correction: '收紧核心，双腿稳定，控制动作节奏' },
        { mistake: '只做半程', correction: '手臂完全伸直起始，下巴过杠为终点，做完整幅度' },
        { mistake: '耸肩代偿', correction: '起始悬挂时主动下沉肩胛骨，全程保持肩膀远离耳朵' },
      ],
      imageHint: '搜索关键词：引体向上标准姿势 / pull up correct form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=引体向上入门教程', webFallback: 'https://search.bilibili.com/all?keyword=引体向上入门教程' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=引体向上教程', webFallback: 'https://www.douyin.com/search/引体向上标准动作' },
      ],
    },
    {
      id: 'lat-pulldown', name: '高位下拉', emoji: '\u{1F3CB}', difficulty: '中级',
      targetMuscles: '背阔肌、大圆肌、肱二头肌、菱形肌',
      description: '高位下拉是引体向上的绝佳替代动作，可以精确控制重量，适合各水平训练者塑造V型背部。',
      steps: [
        { num: 1, title: '调整器械', detail: '调整大腿垫使其紧贴大腿。双手握横杆（约1.5倍肩宽），身体微微后倾约10-15度。' },
        { num: 2, title: '下拉动作', detail: '背部发力，将横杆拉至锁骨或上胸位置。肘部向下后方移动。挺胸，感受背部收缩。' },
        { num: 3, title: '顶峰收缩', detail: '横杆在锁骨处保持1秒，肩胛骨向中间夹紧。不要用身体后仰借力。' },
        { num: 4, title: '还原上升', detail: '控制横杆缓慢上升至手臂伸直，感受背阔肌拉伸。上升时不要完全放松肩膀。' },
      ],
      keyPoints: [
        '用背部发力而非手臂——想象肘部向下移动',
        '身体微微后倾但不要过度（不超过15度）',
        '下拉时挺胸，让锁骨去迎接横杆',
        '控制还原速度，感受肌肉拉伸',
      ],
      commonMistakes: [
        { mistake: '身体过度后仰借力', correction: '减轻重量，保持身体后倾不超过15度' },
        { mistake: '拉到腹部而非锁骨', correction: '横杆目标位置是锁骨/上胸，不是腹部' },
        { mistake: '用手臂拉', correction: '放松前臂握力，专注用背部发力，想象肘部向下后移动' },
      ],
      imageHint: '搜索关键词：高位下拉正确姿势 / lat pulldown form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=高位下拉教学', webFallback: 'https://search.bilibili.com/all?keyword=高位下拉教学' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=高位下拉', webFallback: 'https://www.douyin.com/search/高位下拉标准动作' },
      ],
    },

    // ==================== 臂部训练 ====================
    {
      id: 'curl', name: '弯举', emoji: '\u{1F4AA}', difficulty: '初级',
      targetMuscles: '肱二头肌、肱肌、前臂屈肌',
      description: '哑铃弯举是最经典的肱二头肌训练动作，能有效增加手臂围度和力量，是几乎所有健身者的必练动作。',
      steps: [
        { num: 1, title: '起始站姿', detail: '双脚与肩同宽站立，双手各持哑铃，手臂自然下垂，掌心向前。肘部贴近身体两侧固定不动。' },
        { num: 2, title: '弯举上提', detail: '呼气，肱二头肌发力将哑铃弯举至肩膀高度。全程肘部位置不变，不要前后移动。' },
        { num: 3, title: '顶峰收缩', detail: '哑铃在最高点时用力挤压肱二头肌1秒。手腕保持中立不要翻腕。' },
        { num: 4, title: '下放还原', detail: '吸气，控制哑铃缓慢下放至手臂伸直。下放过程2-3秒，感受肱二头肌的拉伸。' },
      ],
      keyPoints: [
        '肘部全程固定贴紧身体两侧，不要前后移动',
        '身体不要晃动借力，保持躯干稳定',
        '下放时控制速度（离心阶段），不要直接放下',
        '手腕保持中立，不要弯曲手腕辅助',
        '可以做交替弯举或同时弯举的变式',
      ],
      commonMistakes: [
        { mistake: '身体晃动借力', correction: '减轻重量，收紧核心，背靠墙练习确保躯干不晃' },
        { mistake: '肘部前后移动', correction: '肘部锁定在身体两侧，只让小臂做弧线运动' },
        { mistake: '下放太快', correction: '下放时默数2-3秒，离心阶段同样重要' },
      ],
      imageHint: '搜索关键词：哑铃弯举标准姿势 / dumbbell curl form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=哑铃弯举教学', webFallback: 'https://search.bilibili.com/all?keyword=哑铃弯举教学' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=弯举教程', webFallback: 'https://www.douyin.com/search/哑铃弯举标准动作' },
      ],
    },
    {
      id: 'overhead-press', name: '推举', emoji: '\u{1F3CB}', difficulty: '中级',
      targetMuscles: '三角肌（前中束）、肱三头肌、上胸、核心',
      description: '站姿推举是锻炼肩部力量和维度的核心动作，能打造宽肩视觉效果，同时增强核心稳定性和上肢推力。',
      steps: [
        { num: 1, title: '起始位置', detail: '双脚与肩同宽站立，核心收紧。双手持哑铃在肩膀高度，掌心向前。肘部在身体前方微内收。' },
        { num: 2, title: '上推哑铃', detail: '呼气，肩部和手臂发力将哑铃垂直向上推举过头顶。头部微收，哑铃在头顶正上方几乎相触。' },
        { num: 3, title: '锁定顶峰', detail: '手臂伸直但不锁死肘关节。顶峰保持1秒，感受肩部完全收缩。核心全程收紧稳定。' },
        { num: 4, title: '下放还原', detail: '吸气，控制哑铃缓慢下放至肩膀高度。不要自由落体，控制离心阶段2-3秒。' },
      ],
      keyPoints: [
        '核心全程收紧，不要用腰部后仰借力',
        '哑铃运动轨迹是垂直上下，不要划弧线',
        '向上推时头部微收（不要过度后仰），为哑铃让出空间',
        '手腕保持中立，不要过度翻腕',
        '可以做站姿或坐姿变式，坐姿更稳定适合冲重量',
      ],
      commonMistakes: [
        { mistake: '腰部过度后仰', correction: '收紧核心和臀部，减轻重量，或改用坐姿' },
        { mistake: '哑铃向前推而非向上', correction: '哑铃轨迹应垂直向上，在头顶正上方锁定' },
        { mistake: '耸肩', correction: '全程保持肩部下沉，不要用斜方肌代偿' },
      ],
      imageHint: '搜索关键词：哑铃推举标准姿势 / overhead press form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=哑铃推举教学', webFallback: 'https://search.bilibili.com/all?keyword=哑铃推举教学' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=推举教程', webFallback: 'https://www.douyin.com/search/哑铃推举标准动作' },
      ],
    },

    // ==================== 核心训练 ====================
    {
      id: 'plank', name: '平板支撑', emoji: '\u{1F9D8}', difficulty: '初级',
      targetMuscles: '腹直肌、腹横肌、竖脊肌、肩部稳定肌群',
      description: '平板支撑是最有效的基础核心训练，能增强全身稳定性和核心耐力。每天坚持3分钟，腰背疼痛明显改善。',
      steps: [
        { num: 1, title: '进入姿势', detail: '俯卧在垫子上，双肘撑地与肩同宽，小臂平行。双脚并拢，脚趾蹬地。' },
        { num: 2, title: '撑起身体', detail: '收紧核心和臀部，将身体撑离地面。身体从头部到脚踝成一条直线。视线看向地面。' },
        { num: 3, title: '保持稳定', detail: '全身肌肉保持紧张，不要塌腰或翘臀。均匀呼吸，不要憋气。初学者从30秒开始。' },
      ],
      keyPoints: [
        '身体呈一条直线：头-肩-臀-膝-脚踝',
        '收紧核心（想象肚子被人打一拳），收紧臀部',
        '视线向下看，保持颈椎中立',
        '均匀呼吸，不要憋气',
        '从30秒开始，每天增加5-10秒，目标是3分钟',
      ],
      commonMistakes: [
        { mistake: '塌腰（最危险）', correction: '收紧核心+臀部，让骨盆后倾，腰背放平' },
        { mistake: '臀部过高', correction: '收紧臀部，降低臀位使身体成直线' },
        { mistake: '抬头或低头', correction: '视线垂直看地面，保持颈椎与脊柱在一条线' },
      ],
      imageHint: '搜索关键词：平板支撑正确姿势 / plank exercise form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=平板支撑教程', webFallback: 'https://search.bilibili.com/all?keyword=平板支撑教程' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=平板支撑', webFallback: 'https://www.douyin.com/search/平板支撑正确姿势' },
      ],
    },
    {
      id: 'sit-up', name: '仰卧起坐', emoji: '\u{1F3CB}', difficulty: '初级',
      targetMuscles: '腹直肌、腹斜肌、髋屈肌',
      description: '仰卧起坐是经典的腹肌训练动作，能有效锻炼腹直肌（六块腹肌），增强核心力量和腰部灵活性。',
      steps: [
        { num: 1, title: '起始仰卧', detail: '仰卧在垫子上，双膝弯曲约90度，双脚平踩地面。双手交叉放在胸前或轻触耳侧（不要抱头拉脖子）。' },
        { num: 2, title: '卷腹起身', detail: '呼气，腹部发力将上半身卷起。下背部不要完全离开地面。卷至肩胛骨离地即可，不需要坐直。' },
        { num: 3, title: '顶峰收缩', detail: '在最高点用力挤压腹部1-2秒，感受腹肌收紧。颈椎放松，视线看向天花板。' },
        { num: 4, title: '下放还原', detail: '吸气，控制身体缓慢下放。肩部不要完全贴地（保持腹肌持续紧张），或者轻轻触地后继续下一个。' },
      ],
      keyPoints: [
        '手不要抱头用力拉脖子——手放在胸前或耳侧即可',
        '用腹部发力卷起，而不是用腰部或脖子',
        '卷到肩胛骨离地即可，不需要坐直（保护腰椎）',
        '下放时控制速度，利用离心收缩',
        '每组15-25次，3-4组',
      ],
      commonMistakes: [
        { mistake: '双手抱头用力拉脖子', correction: '双手交叉放胸前或轻触耳侧，脖子放松' },
        { mistake: '完全坐直', correction: '卷至肩胛骨离地即可，完全坐直会增加腰椎压力' },
        { mistake: '用惯性弹起', correction: '控制速度，腹肌发力卷起，不要借助惯性' },
      ],
      imageHint: '搜索关键词：仰卧起坐标准姿势 / crunch exercise form',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=仰卧起坐正确做法', webFallback: 'https://search.bilibili.com/all?keyword=仰卧起坐正确做法' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=仰卧起坐', webFallback: 'https://www.douyin.com/search/仰卧起坐标准动作' },
      ],
    },
    {
      id: 'stretching', name: '拉伸', emoji: '\u{1F9D8}', difficulty: '初级',
      targetMuscles: '全身肌群、筋膜、关节活动度',
      description: '拉伸是健身不可或缺的一环。训练前后拉伸能预防受伤、缓解肌肉酸痛、改善体态和柔韧性。每天5-10分钟即可。',
      steps: [
        { num: 1, title: '训练前动态拉伸', detail: '进行5分钟动态拉伸：手臂画圈、高抬腿、弓步转体、开合跳。动作连贯不保持静止，提高身体温度和关节活动度。' },
        { num: 2, title: '训练后静态拉伸', detail: '每个肌群拉伸15-30秒：大腿前侧（站姿拉脚跟）、大腿后侧（坐姿前屈）、胸肩（门口扩胸拉伸）、背部（猫牛式）。' },
        { num: 3, title: '呼吸配合', detail: '拉伸时深长呼吸，呼气时尝试增加拉伸幅度。不要憋气，让肌肉在放松中逐渐延展。' },
        { num: 4, title: '重点区域', detail: '久坐人群重点拉伸：髋屈肌、腘绳肌、胸肌、颈部。每个部位30秒×2组。' },
      ],
      keyPoints: [
        '训练前做动态拉伸（活动关节），训练后做静态拉伸（放松肌肉）',
        '每个静态拉伸保持15-30秒，不要弹震',
        '感到肌肉轻微拉伸感即可，不要到疼痛的程度',
        '呼吸深长，呼气时尝试增加拉伸幅度',
        '特别紧张的部位可用泡沫轴辅助放松',
      ],
      commonMistakes: [
        { mistake: '拉伸时弹震', correction: '静态拉伸应缓慢进入并保持，弹震会导致肌肉保护性收缩' },
        { mistake: '拉伸到疼痛', correction: '只拉伸到轻微不适感，疼痛说明过度拉伸' },
        { mistake: '训练前做长时间静态拉伸', correction: '训练前用动态拉伸，静态拉伸放在训练后' },
      ],
      imageHint: '搜索关键词：全身拉伸动作图解 / full body stretching guide',
      videoLinks: [
        { platform: 'B站', icon: '\u{1F4FA}', url: 'bilibili://search?keyword=全身拉伸教程', webFallback: 'https://search.bilibili.com/all?keyword=全身拉伸教程' },
        { platform: '抖音', icon: '\u{1F3B5}', url: 'snssdk1128://search?keyword=拉伸教程', webFallback: 'https://www.douyin.com/search/全身拉伸放松教程' },
      ],
    },
  ];

  // ---------- 查询方法 ----------
  function getById(id) {
    return TUTORIALS.find(t => t.id === id) || null;
  }

  function getAll() {
    return TUTORIALS;
  }

  /** 按肌群分组（使用 IconsModule.groupOrder） */
  function getGrouped() {
    const groups = {};
    const order = (typeof IconsModule !== 'undefined') ? IconsModule.groupOrder : ['有氧', '腿', '胸', '背', '臂', '核心'];
    order.forEach(g => { groups[g] = []; });

    TUTORIALS.forEach(t => {
      // 通过 IconsModule 获取该动作的所属分组
      let group = '核心';
      if (typeof IconsModule !== 'undefined') {
        const icon = IconsModule.getById(t.id);
        if (icon && icon.group) group = icon.group;
      }
      if (groups[group]) {
        groups[group].push(t);
      } else {
        // 兜底：放入第一个分组
        if (!groups['其他']) groups['其他'] = [];
        groups['其他'].push(t);
      }
    });
    return groups;
  }

  // ---------- 视频跳转 ----------
  function openVideo(videoLink) {
    const { url, webFallback } = videoLink;
    if (!url) return;

    const startTime = Date.now();
    // 尝试打开原生 App（URL Scheme）
    window.location.href = url;

    // 800ms 后如果页面未跳转，fallback 到网页
    setTimeout(() => {
      if (Date.now() - startTime < 1200 && webFallback) {
        window.open(webFallback, '_blank');
      }
    }, 800);
  }

  // ---------- 渲染教程面板 ----------
  const overlay = () => document.getElementById('modal-overlay');
  const content = () => document.getElementById('modal-content');

  /** 打开教程面板。传入 iconId 则直达详情页 */
  function show(iconId) {
    const ov = overlay();
    const ct = content();
    if (!ov || !ct) return;

    if (iconId) {
      showDetail(iconId);
    } else {
      showList();
    }
    ov.classList.add('show');
  }

  /** 渲染列表视图：分组卡片网格 */
  function showList() {
    const ct = content();
    const grouped = getGrouped();
    const groupsWithData = Object.entries(grouped).filter(([, tutorials]) => tutorials.length > 0);

    ct.innerHTML = `
      <h3 style="margin-bottom:var(--space-md);color:var(--color-primary-dark);font-weight:600;letter-spacing:0.5px;">
        📖 健身动作教程
      </h3>
      <p style="font-size:var(--font-caption);color:var(--color-text-light);margin-bottom:var(--space-lg);">
        点击任意动作查看详细教程，包括动作步骤、要点、常见错误及视频演示
      </p>
      ${groupsWithData.map(([groupName, tutorials]) => `
        <div class="tutorial-group">
          <span class="tutorial-group-label">${groupName}</span>
          <div class="tutorial-card-grid">
            ${tutorials.map(t => `
              <div class="tutorial-card" data-tutorial="${t.id}">
                <span class="tutorial-card-emoji">${t.emoji}</span>
                <span class="tutorial-card-name">${t.name}</span>
                <span class="tutorial-card-difficulty ${difficultyClass(t.difficulty)}">${t.difficulty}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;

    // 委托事件：点击卡片进入详情
    ct.querySelectorAll('.tutorial-card').forEach(card => {
      card.addEventListener('click', () => {
        showDetail(card.getAttribute('data-tutorial'));
      });
    });
  }

  /** 渲染详情视图 */
  function showDetail(id) {
    const t = getById(id);
    const ct = content();
    if (!t) { showList(); return; }

    ct.innerHTML = `
      <div class="tutorial-detail">
        <button class="tutorial-back-btn" id="tutorial-back">← 返回列表</button>

        <div class="tutorial-detail-header">
          <span class="tutorial-detail-emoji">${t.emoji}</span>
          <h2 class="tutorial-detail-title">${t.name}</h2>
          <span class="tutorial-difficulty-badge ${difficultyClass(t.difficulty)}">${t.difficulty}</span>
        </div>

        <p class="tutorial-section-text" style="margin-bottom:var(--space-lg);">${t.description}</p>

        <div class="tutorial-section">
          <h3 class="tutorial-section-title">🎯 目标肌群</h3>
          <p class="tutorial-section-text">${t.targetMuscles}</p>
        </div>

        <div class="tutorial-section">
          <h3 class="tutorial-section-title">📋 动作步骤</h3>
          <ol class="tutorial-steps">
            ${t.steps.map(s => `
              <li class="tutorial-step">
                <span class="tutorial-step-num">${s.num}</span>
                <div class="tutorial-step-content">
                  <strong>${s.title}</strong>
                  <p>${s.detail}</p>
                </div>
              </li>
            `).join('')}
          </ol>
        </div>

        <div class="tutorial-section">
          <h3 class="tutorial-section-title">💡 动作要点</h3>
          <ul class="tutorial-keypoints">
            ${t.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
          </ul>
        </div>

        <div class="tutorial-section">
          <h3 class="tutorial-section-title">⚠️ 常见错误</h3>
          <div class="tutorial-mistakes">
            ${t.commonMistakes.map(m => `
              <div class="tutorial-mistake-item">
                <span class="tutorial-mistake-wrong">❌ ${m.mistake}</span>
                <span class="tutorial-mistake-right">✅ ${m.correction}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tutorial-section">
          <h3 class="tutorial-section-title">📷 动作图示</h3>
          <div class="tutorial-image-placeholder">
            <span class="tutorial-image-emoji">${t.emoji}${t.emoji}${t.emoji}</span>
            <p class="tutorial-image-hint">${t.imageHint}</p>
          </div>
        </div>

        <div class="tutorial-section">
          <h3 class="tutorial-section-title">🎬 视频教程</h3>
          <div class="tutorial-video-links">
            ${t.videoLinks.map(v => `
              <button class="tutorial-video-btn" data-url="${escapeAttr(v.url)}" data-fallback="${escapeAttr(v.webFallback)}">
                <span>${v.icon}</span> 在${v.platform}观看
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // 返回按钮
    document.getElementById('tutorial-back').addEventListener('click', showList);

    // 视频按钮
    ct.querySelectorAll('.tutorial-video-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openVideo({
          url: btn.getAttribute('data-url'),
          webFallback: btn.getAttribute('data-fallback'),
        });
      });
    });
  }

  // ---------- 工具函数 ----------
  function difficultyClass(level) {
    if (level === '初级') return 'difficulty-beginner';
    if (level === '中级') return 'difficulty-intermediate';
    if (level === '高级') return 'difficulty-advanced';
    return '';
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- 公开 API ----------
  return {
    getById,
    getAll,
    getGrouped,
    show,
    showList,
    showDetail,
    openVideo,
  };

})();

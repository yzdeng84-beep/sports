# Cadence — ProGuard 规则
# 纯 WebView 应用，无混淆需求
-keepattributes *Annotation*
-keep class com.cadence.app.** { *; }

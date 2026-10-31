#!/bin/sh
# Writes the app icons and splash screens into the iOS and Android projects
# from the source images in assets/. Uses macOS `sips`, so no native npm
# modules are needed. Run from apps/mobile: `npm run assets`.
#
# Sources (edit these, then re-run):
#   assets/icon-only.png        1024x1024, no transparency: iOS icon, Android legacy icon
#   assets/icon-round.png       1024x1024, round on transparent: Android legacy round icon
#   assets/icon-foreground.png  1024x1024, transparent: Android adaptive icon foreground
#   assets/splash.png           2732x2732: light splash
#   assets/splash-dark.png      2732x2732: dark splash
set -eu
cd "$(dirname "$0")/.."

ICON_BG='#9A4A26' # rust, the brand's profile-icon colour
A=assets
IOS=ios/App/App/Assets.xcassets
RES=android/app/src/main/res

resize() { sips -s format png -z "$3" "$2" "$1" --out "$4" >/dev/null; } # src w h out

# Centre-crop a square source to the aspect of w x h, then scale to w x h.
crop_to() { # src w h out
  src=$1 w=$2 h=$3 out=$4
  side=$(sips -g pixelWidth "$src" | awk 'NR==2{print $2}')
  if [ "$w" -ge "$h" ]; then cw=$side; ch=$((side * h / w)); else ch=$side; cw=$((side * w / h)); fi
  tmp=$(mktemp -t kk-splash).png
  sips -s format png -c "$ch" "$cw" "$src" --out "$tmp" >/dev/null
  sips -z "$h" "$w" "$tmp" --out "$out" >/dev/null
  rm -f "$tmp"
}

# iOS: one 1024 icon; the splash in light and dark.
resize $A/icon-only.png 1024 1024 $IOS/AppIcon.appiconset/AppIcon-512@2x.png
for f in splash-2732x2732 splash-2732x2732-1 splash-2732x2732-2; do
  cp $A/splash.png $IOS/Splash.imageset/$f.png
  cp $A/splash-dark.png $IOS/Splash.imageset/$f-dark.png
done
cat > $IOS/Splash.imageset/Contents.json <<'EOF'
{
  "images" : [
    { "idiom" : "universal", "filename" : "splash-2732x2732-2.png", "scale" : "1x" },
    { "idiom" : "universal", "filename" : "splash-2732x2732-2-dark.png", "scale" : "1x",
      "appearances" : [ { "appearance" : "luminosity", "value" : "dark" } ] },
    { "idiom" : "universal", "filename" : "splash-2732x2732-1.png", "scale" : "2x" },
    { "idiom" : "universal", "filename" : "splash-2732x2732-1-dark.png", "scale" : "2x",
      "appearances" : [ { "appearance" : "luminosity", "value" : "dark" } ] },
    { "idiom" : "universal", "filename" : "splash-2732x2732.png", "scale" : "3x" },
    { "idiom" : "universal", "filename" : "splash-2732x2732-dark.png", "scale" : "3x",
      "appearances" : [ { "appearance" : "luminosity", "value" : "dark" } ] }
  ],
  "info" : { "version" : 1, "author" : "xcode" }
}
EOF

# Android launcher icons: legacy square and round, plus the adaptive foreground.
for pair in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
  d=${pair%%:*} s=${pair##*:}
  resize $A/icon-only.png "$s" "$s" $RES/mipmap-$d/ic_launcher.png
  resize $A/icon-round.png "$s" "$s" $RES/mipmap-$d/ic_launcher_round.png
  fg=$((s * 108 / 48))
  resize $A/icon-foreground.png "$fg" "$fg" $RES/mipmap-$d/ic_launcher_foreground.png
done
cat > $RES/values/ic_launcher_background.xml <<EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">$ICON_BG</color>
</resources>
EOF

# Android splash: every existing drawable*/splash.png at its own size, plus night copies.
for f in $RES/drawable*/splash.png; do
  case $f in *-night*) continue ;; esac
  w=$(sips -g pixelWidth "$f" | awk 'NR==2{print $2}')
  h=$(sips -g pixelHeight "$f" | awk 'NR==2{print $2}')
  dir=$(basename "$(dirname "$f")")
  night=$RES/$(echo "$dir" | sed 's/^drawable/drawable-night/')
  mkdir -p "$night"
  crop_to $A/splash.png "$w" "$h" "$f"
  crop_to $A/splash-dark.png "$w" "$h" "$night/splash.png"
done

echo "Icons and splash screens written for iOS and Android."

#!/bin/sh
sed -i 's#__CLOUDINARY_URL__#'"$CLOUDINARY_URL"'#g' /usr/share/nginx/html/index.html
sed -i 's#__CLOUDINARY_API_KEY__#'"$CLOUDINARY_API_KEY"'#g' index.html
sed -i 's#__API_URL__#'"$API_URL"'#g' /usr/share/nginx/html/index.html
sed -i 's#__RTC_URL__#'"$RTC_URL"'#g' /usr/share/nginx/html/index.html
sed -i 's#__WS_URL__#'"$WS_URL"'#g' /usr/share/nginx/html/index.html
exec "$@"

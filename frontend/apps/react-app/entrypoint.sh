#!/bin/sh
sed -i 's#%VITE_HOST%#'"$HOST"'#g' /usr/share/nginx/html/index.html
sed -i 's#%VITE_CLOUDINARY_URL%#'"$CLOUDINARY_URL"'#g' /usr/share/nginx/html/index.html
sed -i 's#%VITE_CLOUDINARY_RES_URL%#'"$CLOUDINARY_RES_URL"'#g' index.html
sed -i 's#%VITE_CLOUDINARY_API_KEY%#'"$CLOUDINARY_API_KEY"'#g' index.html
sed -i 's#%VITE_API_URL%#'"$API_URL"'#g' /usr/share/nginx/html/index.html
sed -i 's#%VITE_RTC_URL%#'"$RTC_URL"'#g' /usr/share/nginx/html/index.html
sed -i 's#%VITE_WS_URL%#'"$WS_URL"'#g' /usr/share/nginx/html/index.html
exec "$@"

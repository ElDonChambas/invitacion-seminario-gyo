# Plantilla Web — Invitación Interactiva con Sobre

## Estructura de carpetas

```text
invitacion-web/
├── index.html          # Estructura completa de la invitación
├── styles.css          # Estilos editoriales (Ivory / Gold / Serif & Script)
├── script.js           # Precarga del video, apertura del sobre, audio player y countdown
├── img/
│   ├── portada.svg     # Reemplazar por portada.jpg (o actualizar src en index.html)
│   └── reproductor.svg # Reemplazar por reproductor.png (carátula del reproductor)
└── media/
    ├── sobre.mp4       # <--- Coloca aquí tu video editado del sobre
    └── cancion.mp3     # <--- Coloca aquí tu pista de audio de fondo
```

## Cómo probarlo localmente

1. Copia tu video editado dentro de la carpeta `media/` con el nombre `sobre.mp4`.
2. Copia tu archivo de audio dentro de `media/` con el nombre `cancion.mp3` (opcional; si no hay audio, el sobre igual abre sin errores).
3. Abre `index.html` con Live Server en VS Code o sube la carpeta a GitHub + Vercel / Cloudflare Pages.

# Portfolio

## Setup
1. Install Node.js (LTS) from https://nodejs.org
2. Copy your frames into `public/frames/`, so you have:
   - public/frames/idle/0001.webp ... 0320.webp
   - public/frames/greet/0001.webp ... 0160.webp
3. In this folder run:
   npm install
   npm run dev
4. Open the link it prints (usually http://localhost:5173)

## Edit your content
Everything is in `src/config.js`: name, role, intro, projects, skills, email, links.
If you make new clips, update the frame counts in `HERO.segments` there.

## Add left/right clips later
Put frames in public/frames/left and public/frames/right, then set their `count` in config.js.

## Publish
npm run build  -> upload the `dist` folder to Netlify, Vercel or GitHub Pages.

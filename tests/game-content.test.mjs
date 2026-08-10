import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function readActiveGameBundle() {
  const html = await readFile(new URL("public/game/index.html", root), "utf8");
  const directScriptPath = html.match(/src="\.\/assets\/(index-[^"]+\.js)"/)?.[1];
  const guard = await readFile(
    new URL("public/game/assets/graphics-guard.js", root),
    "utf8",
  );
  const guardedScriptPath = guard.match(/import\('\.\/(index-[^']+\.js)'\)/)?.[1];
  const scriptPath = directScriptPath ?? guardedScriptPath;

  assert.ok(scriptPath);

  return readFile(new URL(`public/game/assets/${scriptPath}`, root), "utf8");
}

test("ships personalized portfolio content", async () => {
  const html = await readFile(new URL("public/game/index.html", root), "utf8");

  assert.match(html, /文山木公 · OVWS/);
  assert.match(html, /work@qiwensong\.com/);
  assert.match(html, /https:\/\/github\.com\/ovws/);
  assert.doesNotMatch(html, /Bruno's Home|simon\.bruno\.77@gmail\.com/);
});

test("keeps every social label on its matching physical landmark", async () => {
  const social = await readFile(new URL("game-src/data/social.js", root), "utf8");
  const socialArea = await readFile(new URL("game-src/Game/World/Areas/SocialArea.js", root), "utf8");
  const html = await readFile(new URL("public/game/index.html", root), "utf8");
  const builtScript = await readActiveGameBundle();

  assert.match(social, /name: 'X \/ Twitter', url: 'https:\/\/x\.com\/wensqi', align: 'right'/);
  assert.match(social, /\{ hidden: true \}/);
  assert.match(social, /name: 'YouTube', url: 'https:\/\/www\.youtube\.com\/@aixuer', align: 'right'/);
  assert.match(social, /name: 'Mail', url: 'mailto:work@qiwensong\.com', align: 'right'/);
  assert.match(social, /name: 'Twitch', url: 'https:\/\/www\.twitch\.tv\/cmiws', align: 'right'/);
  assert.match(social, /name: 'GitHub', url: 'https:\/\/github\.com\/ovws', align: 'right'/);
  assert.match(social, /name: 'LinkedIn', url: 'https:\/\/www\.linkedin\.com\/in\/qiws', align: 'left'/);
  assert.match(social, /name: 'Discord', modal: 'contact', align: 'left'/);
  assert.match(socialArea, /for\(const \[ index, link \] of socialData\.entries\(\)\)/);
  assert.match(socialArea, /if\(link\.hidden\)\s+continue/);
  assert.match(socialArea, /const angle = index \* Math\.PI \/ \(slotCount - 1\)/);

  for (const [label, target] of [
    ["X / Twitter", "https://x.com/wensqi"],
    ["YouTube", "https://www.youtube.com/@aixuer"],
    ["Mail", "mailto:work@qiwensong.com"],
    ["Twitch", "https://www.twitch.tv/cmiws"],
    ["GitHub", "https://github.com/ovws"],
    ["LinkedIn", "https://www.linkedin.com/in/qiws"],
  ]) {
    assert.ok(social.includes(`name: '${label}'`));
    assert.ok(social.includes(target));
    assert.ok(builtScript.includes(target));
  }

  assert.match(social, /name: 'Discord', modal: 'contact'/);
  assert.match(html, /Discord 用户名：<strong>ws\.qi<\/strong>/);
  assert.doesNotMatch(social, /blog\.loser\.dev|github\.com\/wikiq|x\.com\/qwstdx/);
});

test("shows a usable fallback when the 3D renderer cannot start", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const entry = await readFile(new URL("game-src/index.js", root), "utf8");
  const game = await readFile(new URL("game-src/Game/Game.js", root), "utf8");
  const style = await readFile(new URL("game-src/style/general.styl", root), "utf8");
  const html = await readFile(new URL("public/game/index.html", root), "utf8");
  const guard = await readFile(
    new URL("public/game/assets/graphics-guard.js", root),
    "utf8",
  );

  assert.match(page, /setGraphicsAvailable\(hasWebGpu \|\| hasWebGl2\)/);
  assert.doesNotMatch(page, /hasWebGl\s*=/);
  assert.match(page, /ovws-game-startup-error/);
  assert.match(page, /graphicsAvailable === true/);
  assert.match(entry, /const hasWebGL2 = Boolean\(probe\.getContext\('webgl2'\)\)/);
  assert.match(entry, /game\.ready\.catch\(showStartupError\)/);
  assert.match(entry, /window\.parent\.postMessage\(\{ type: 'ovws-game-startup-error' \}/);
  assert.match(game, /this\.ready = this\.init\(\)/);
  assert.match(style, /\.startup-error/);
  assert.match(html, /assets\/graphics-guard\.js/);
  assert.match(guard, /Boolean\(probe\.getContext\('webgl2'\)\)/);
  assert.match(guard, /import\('\.\/index-BSIXIL5J\.js'\)\.catch\(showStartupError\)/);
  assert.match(guard, /unhandledrejection/);
});

test("ships both map themes and a non-lazy map texture", async () => {
  const html = await readFile(new URL("public/game/index.html", root), "utf8");
  const mapSource = await readFile(new URL("game-src/Game/Map.js", root), "utf8");
  const mapStyle = await readFile(new URL("game-src/style/map.styl", root), "utf8");
  const dayMap = await stat(new URL("public/game/ui/map/map-day.webp", root));
  const nightMap = await stat(new URL("public/game/ui/map/map-night.webp", root));

  assert.match(html, /class="js-texture texture" alt="3D 世界地图"/);
  assert.doesNotMatch(html, /class="js-texture texture" loading="lazy"/);
  assert.match(mapSource, /map-\$\{theme\}\.webp/);
  assert.match(mapSource, /map-\$\{theme\}\.png/);
  assert.match(mapStyle, /calc\(100vmin - 64px\)/);
  assert.ok(dayMap.size > 100_000);
  assert.ok(nightMap.size > 60_000);
});

test("removes Circuit, Leave a Whisper, and remote backend connections", async () => {
  const html = await readFile(new URL("public/game/index.html", root), "utf8");
  const sourceHtml = await readFile(new URL("game-src/index.html", root), "utf8");
  const areas = await readFile(new URL("game-src/Game/World/Areas/Areas.js", root), "utf8");
  const world = await readFile(new URL("game-src/Game/World/World.js", root), "utf8");
  const server = await readFile(new URL("game-src/Game/Server.js", root), "utf8");
  const map = await readFile(new URL("game-src/Game/Map.js", root), "utf8");
  const achievements = await readFile(new URL("game-src/data/achievements.js", root), "utf8");

  for (const content of [html, sourceHtml]) {
    assert.doesNotMatch(content, /data-name="(?:circuit|whispers)"/i);
    assert.doesNotMatch(content, /leave a whisper|post a whisper|circuit-content|whispers-content/i);
    assert.doesNotMatch(content, /js-server|server currently offline/i);
  }

  assert.doesNotMatch(areas, /CircuitArea|\[\s*'circuit'/);
  assert.doesNotMatch(world, /Whispers|new Whispers/);
  assert.doesNotMatch(server, /WebSocket|VITE_SERVER_URL|msgpack|uuid/i);
  assert.doesNotMatch(map, /respawnName:\s*'circuit'/);
  assert.doesNotMatch(achievements, /'whisper'|'circuitFinish|'circuitLeaderboard/);
});

test("renders 文山木公 as the physical Home lettering", async () => {
  const landing = await readFile(new URL("game-src/Game/World/Areas/LandingArea.js", root), "utf8");
  const builtScript = await readActiveGameBundle();
  const commonFont = await stat(new URL("public/game/fonts/NotoSansSC-118-wght-normal.woff2", root));
  const mountainFont = await stat(new URL("public/game/fonts/NotoSansSC-116-wght-normal.woff2", root));
  const woodFont = await stat(new URL("public/game/fonts/NotoSansSC-114-wght-normal.woff2", root));

  assert.match(landing, /const name = '文山木公'/);
  assert.match(landing, /firstPosition\.clone\(\)\.sub\(lastPosition\)/);
  assert.match(landing, /new THREE\.PlaneGeometry\(1\.5, 1\.5\)/);
  assert.match(landing, /physical\.body\.setTranslation\(targetPosition/);
  assert.match(landing, /reference\.visible = false/);
  assert.match(landing, /physical\.body\.setEnabled\(false\)/);
  assert.match(landing, /this\.game\.reveal\.step < 2/);
  assert.match(landing, /gsap\.to\(layer\.material, \{ opacity: 1/);
  assert.match(builtScript, /\\u6587\\u5C71\\u6728\\u516C/);
  assert.ok(commonFont.size > 40_000);
  assert.ok(mountainFont.size > 40_000);
  assert.ok(woodFont.size > 40_000);
});

test("localizes the visible interface and intro prompt into Chinese", async () => {
  const html = await readFile(new URL("public/game/index.html", root), "utf8");
  const intro = await readFile(new URL("game-src/Game/World/Intro.js", root), "utf8");
  const map = await readFile(new URL("game-src/Game/Map.js", root), "utf8");
  const achievements = await readFile(new URL("game-src/data/achievements.js", root), "utf8");
  const projects = await readFile(new URL("game-src/data/projects.js", root), "utf8");
  const introPointFont = await stat(new URL("public/game/fonts/NotoSansSC-119-wght-normal.woff2", root));
  const introHitFont = await stat(new URL("public/game/fonts/NotoSansSC-117-wght-normal.woff2", root));

  assert.match(html, />设置</);
  assert.match(html, />键盘鼠标</);
  assert.match(html, />成就</);
  assert.doesNotMatch(html, />Options<|>Achievements<|>Rewards<|>Interact<|>Unstuck</);
  assert.match(intro, /fillText\('点击开始'/);
  assert.doesNotMatch(intro, /mouseKeyboardLabel|gamepadXboxLabel|touchLabel/);
  assert.match(map, /name: '主页'/);
  assert.doesNotMatch(map, /name: '(?:Home|Projects|Lab|Achievements)'/);
  assert.match(achievements, /'旅行者'/);
  assert.match(projects, /title: '鏡花水月'/);
  assert.ok(introPointFont.size > 40_000);
  assert.ok(introHitFont.size > 40_000);
});

import { MapProjection } from './MapProjection';

let cachedCommands: string = '';
let loading: boolean = false;

/** 异步加载 rawfile 陆地轮廓并缓存 Path commands。 */
export async function loadMapLandCommands(context: Context): Promise<string> {
  if (cachedCommands.length > 0) {
    return cachedCommands;
  }
  if (loading) {
    return cachedCommands;
  }
  loading = true;
  try {
    const rm = context.resourceManager;
    const raw = await rm.getRawFileContent('ne_110m_land.json');
    const text = bufferToUtf8(raw);
    cachedCommands = MapProjection.buildPathCommandsFromGeoJson(text);
  } catch (_e) {
    cachedCommands = '';
  } finally {
    loading = false;
  }
  return cachedCommands;
}

function bufferToUtf8(buf: Uint8Array): string {
  let out = '';
  for (let i = 0; i < buf.length; i++) {
    out += String.fromCharCode(buf[i]);
  }
  return out;
}

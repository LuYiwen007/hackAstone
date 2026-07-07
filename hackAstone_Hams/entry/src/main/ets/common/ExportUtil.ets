import { fileIo } from '@kit.CoreFileKit';
import { picker } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';

/** 将 Markdown 文本导出到用户选择的位置（对齐 Web DebateSummary 下载）。 */
export async function exportMarkdownFile(context: common.UIAbilityContext, fileName: string, content: string): Promise<boolean> {
  const options = new picker.DocumentSaveOptions();
  options.newFileNames = [fileName.endsWith('.md') ? fileName : `${fileName}.md`];
  const savePicker = new picker.DocumentViewPicker(context);
  const uris = await savePicker.save(options);
  if (!uris || uris.length === 0) {
    return false;
  }
  const file = fileIo.openSync(uris[0], fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE);
  fileIo.writeSync(file.fd, content);
  fileIo.closeSync(file);
  return true;
}

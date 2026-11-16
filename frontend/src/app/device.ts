import { Capacitor } from "@capacitor/core";
import { Clipboard } from "@capacitor/clipboard";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
export async function copyText(text: string) {
  await Clipboard.write({ string: text });
}
export async function saveText(
  name: string,
  text: string,
  mime = "text/plain",
) {
  if (!Capacitor.isNativePlatform()) {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const file = await Filesystem.writeFile({
    path: name,
    data: text,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  if (!(await Share.canShare()).value)
    throw new Error("Sharing is unavailable. Use Copy instead.");
  await Share.share({
    title: name,
    files: [file.uri],
    dialogTitle: "Share " + name,
  });
}

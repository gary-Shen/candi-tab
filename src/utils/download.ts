export default function download(url: string, name: string) {
  const link = document.createElement('a');
  link.setAttribute('download', name);
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

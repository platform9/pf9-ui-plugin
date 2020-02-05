interface DownloadParams {
  filename: string // including extension
  contents: string // contents of the file
  contentType?: string // MIME Content-Type
}

const downloadFile = ({
  filename,
  contents,
  contentType = 'application/octet-stream',
}: DownloadParams): void => {
  const blob = new Blob([contents], { type: contentType })
  const elem = window.document.createElement('a')
  elem.href = window.URL.createObjectURL(blob)
  elem.download = filename
  document.body.appendChild(elem)
  elem.click()
  document.body.removeChild(elem)
}

export default downloadFile

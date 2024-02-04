const geomeIFrame = document.getElementById('geome-query-iframe')

const iframeWindow = geomeIFrame.contentWindow
const iframeDocument = geomeIFrame.contentDocument

const geomeHeader = iframeDocument.getElementsByClassName('ng-isolate-scope')

console.log(geomeHeader)
export function renderPreviewError(stage, error) {
  const container = stage.ownerDocument.createElement('div')
  container.className = 'sf-empty-state'
  const heading = stage.ownerDocument.createElement('h1')
  heading.className = 'sf-text-h3'
  heading.textContent = 'Preview unavailable'
  const message = stage.ownerDocument.createElement('p')
  message.textContent = String(error?.message ?? error)
  container.append(heading, message)
  stage.replaceChildren(container)
}

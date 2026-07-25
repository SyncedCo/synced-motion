export function restoreRecipeLinkFocus(grid, recipeId) {
  if (!grid || !recipeId) return false
  const link = [...grid.querySelectorAll('[data-inspect-recipe]')]
    .find((entry) => entry.getAttribute('data-inspect-recipe') === recipeId)
  if (!link) return false
  link.focus({ preventScroll: true })
  return true
}

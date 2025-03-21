// @ts-nocheck - Disable all type checking for this file

// Workaround for removeChild and insertBefore errors when google translate is enabled
// See https://github.com/facebook/react/issues/11538#issuecomment-417504600.
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console) {
        console.error('Cannot remove a child from a different parent', child, this);
      }
      return child;
    }
    // biome-ignore lint/style/noArguments: using arguments is simpler
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.error(
          'Cannot insert before a reference node from a different parent',
          referenceNode,
          this,
        );
      }
      return newNode;
    }
    // biome-ignore lint/style/noArguments: using arguments is simpler
    return originalInsertBefore.apply(this, arguments);
  };
}

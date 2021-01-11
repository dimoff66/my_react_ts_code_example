function nextSmaller(n){
  const 
    forv = [...`${n}`].map(Number),
    rev  = forv.map((v, i) => ({ v, i })).reverse(),
    el1 = rev.find((_, i, a) => a[i-1].v < a[i].v)

  if (!el1) return -1

  const el2 = rev.find(v => v.v < el1.v)
  if (el2) {
    [forv[el1.i], forv[el2.i]] = [el2.v, el1.v] 
  }

  const nn = Number([
    ...forv.slice(0, el1.i + 1),
    ...forv.slice(el1.i + 1).reverse
  ].join(''));

  return nn
}

function nextSmaller(n){
  const rev = [...`${n}`].map(Number).reverse()
  const idx1 = rev.find((v, i, a) => i && a[i-1] < v)

  if (idx1 < 0) return idx1

  const idx2 = rev.slice(0, idx1).find(v => v < rev[idx1])
  if (idx2 >= 0) {
    [rev[idx1], rex[idx2]] = [rev[idx2], rex[idx1]]
  }

  const nn = Number(
    rev.slice(idx1)
      .reverse()
      .concat(rev.slice(0, idx1))
      .join('')
    )

  return nn
}
  
console.log(nextSmaller(133232766512347)) 
  
console.log(nextSmaller(133232766512347)) 

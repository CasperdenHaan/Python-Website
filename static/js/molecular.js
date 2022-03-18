import Decimal from "./Decimal.js"

const compoundGroupRegex = /(\(|\[|\{)(?=[^([{]*$)([^)\]}]+)(\)|\}|\])(\d+\.\d+|\d*)/
const elementGroupRegex = /([A-Z][a-z]*)(\d+\.\d+|\d*)/g
const numericPortionRegex = /\d+(\.\d+)?/

function parse(compound) {
  let flattenedCompound = flatten(compound)
  let elementGroups = flattenedCompound.match(elementGroupRegex)

  let compoundObject = elementGroups.reduce((accu, elem) => {
    let count = '1'
    let atom = elem

    if (numericPortionRegex.test(elem)) {
      count = elem.match(numericPortionRegex)[0]
      atom = elem.replace(numericPortionRegex, '')
    }
    return appendElement(accu, atom, count)
  }, {})

  for (atom in compoundObject) {
    compoundObject[atom] = compoundObject[atom].toDecimalPlaces(4).toNumber()
  }
  return compoundObject
}

// private
function appendElement(accu, element, count) {
  if(accu[element]) {
    accu[element] = Decimal.add(accu[element], count)
  } else {
    accu[element] = new Decimal(count)
  }
  return accu
}

function flatten(compound) {
  let hypenGroups = groupByHypen(compound)
  let simpleCompoundGroups = hypenGroups.map(unGroupByBracket)

  return simpleCompoundGroups.join('')
}

// private
function groupByHypen(compound) {
  return compound.split("-")
}

// private
function unGroupByBracket(compound) {
  while (compoundGroupRegex.exec(compound)) {
    compound = compound.replace(compoundGroupRegex, ungroupOneLevel(compound))
  }

  return compound
}

// private
function ungroupOneLevel(compound) {
  let [_all, _op, innerCompound, _cp, multiplier] = compoundGroupRegex.exec(compound)
  let elements = parseElements(innerCompound)

  return elements.reduce((accu, elem) => {
    let number = Decimal.mul(elem.count, multiplier)
    let numericPortion = number.toString()
    return accu + `${elem.atom}${numericPortion}`
  }, '')
}

// private
function parseElements(compound, allowDecimal) {
  let elementGroups = compound.match(elementGroupRegex)

  return elementGroups.reduce((accu, elem) => {
    let count = '1'
    let atom = elem

    if (numericPortionRegex.test(elem)) {
      count = elem.match(numericPortionRegex)[0]
      atom = elem.replace(numericPortionRegex, '')
    }

    return [...accu, {atom, count}]
  }, [])
}

module.exports = {parse, flatten}

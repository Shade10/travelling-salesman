import matrix from './matrix';

export default class Life {
  constructor (gene = 100) {
    this.gene = Array.isArray(gene) ? gene.slice(0) : this.renderGene(gene)
    this.score = 0
  }

  renderGene (n) {
    return matrix((new Array(n)).fill(0).map((_, idx) => idx))
  }

  setScore (v) {
    this.score = v
  }

  toString () {
    return this.gene.join('-')
  }
}
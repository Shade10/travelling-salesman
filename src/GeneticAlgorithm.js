import Life from './Life'

export default class GA {
  constructor (options) {
    this.x_rate = options.x_rate || 0.7
    this.life_count = options.life_count || 50
    this.gene_length = options.gene_length || 100
    this.lives = []
    this.scores = 0 
    this.best = null

    this.rate = options.rate
    this.crossFunc = options.crossFunc

    for (let i = 0; i < this.life_count; i++) {
      this.lives.push(new Life(this.gene_length))
    }
  }

  // Calculate the score of each individual based on the method passed in
  doRate () {
    this.scores = 0
    let last_best_score = -1

    this.lives.map(lf => {
      lf.setScore(this.rate(lf.gene))
      if (lf.score > last_best_score) {
        last_best_score = lf.score
        this.best = lf
      }
      this.scores += lf.score
    })
  }

  descendand (p1, p2) {
    // generate descendants, based on p1 & p2 
    let gene
    if (Math.random() < this.x_rate) {
      gene = this.crossFunc(p1, p2)
    } else {
      gene = p1.gene.slice(0)
    }
    return new Life(gene)
  }

  getOne () {
    let {scores, lives} = this
    let r = Math.random() * scores

    for (let i = 0, l = lives.length; i < l; i++) {
      let lf = lives[i]
      r -= lf.score
      if (r <= 0) {
        return lf
      }
    }
  }

  newChild () {
    return this.descendand(this.getOne(), this.getOne())
  }

  next () {
    this.doRate()
    let new_lives = []
    new_lives.push(this.best)  
    new_lives.push(new Life(this.gene_length))  
    while (new_lives.length < this.life_count) {
      new_lives.push(this.newChild())
    }
    this.lives = new_lives
    let bestPath =this.best.gene

    return this.best.gene.slice(0)
  }
}

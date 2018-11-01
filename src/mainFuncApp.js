import matrix from './matrix'
import GA from './GeneticAlgorithm'
import promise from './promise'




export default class mainFuncApp {
  constructor(el, width, height, onstart, onstop) {
    this.el = el
    this.width = width
    this.height = height
    this.nodes = []
    this.orders = []
    this.radius = 8
    this.lw = 2

    this.mutation_rate = 0.05

    this.deviceRatio = window.devicePixelRatio || 1

    this.el
      .attr('width', width * this.deviceRatio)
      .attr('height', height * this.deviceRatio)
      .css({ width: Math.min(width, screen.width) + 'px' })

    this.ctx = this.el[0].getContext('2d')
    this.is_running = false

    this._onstart = onstart
    this._onstop = onstop
  }

  makeRandomNodes(n = 32, life_count = 100) {
    this.is_running = false
    this.n = n
    this.life_count = life_count
    this.nodes = []
    this.orders = []

    let padding = 20

    for (let i = 0; i < n; i++) {
      this.nodes.push({
        x: Math.floor(Math.random() * (this.width - padding * 2)) + padding,
        y: Math.floor(Math.random() * (this.height - padding * 2)) + padding
      })
      this.orders.push(i)
    }

    matrix(this.orders)
    this.orders.push(this.orders[0])

    this.ga = new GA({
      life_count: this.life_count,
      mutation_rate: this.mutation_rate,
      gene_length: this.n,
      rate: this.rate.bind(this),
      crossFunc: this.crossFunc.bind(this),
      mutateFunc: this.mutateFunc.bind(this)
    })
  }

  rate(gene) {
    return 1 / this.getDistance(gene)
  }

  crossFunc(lef1, lef2) {
    let point1 = Math.floor(Math.random() * (this.n - 2)) + 1
    let point2 = Math.floor(Math.random() * (this.n - point1)) + point1
    let piece = lef2.gene.slice(point1, point2)
    let new_gene = lef1.gene.slice(0, point1)
    piece.concat(lef2.gene).map(i => {
      if (!new_gene.includes(i)) {
        new_gene.push(i)
      }
    })

    return new_gene
  }

  mutateFunc(gene) {
    let point1 = 0
    let point2 = 0
    let n = gene.length
    while (point1 === point2) {
      point1 = Math.floor(Math.random() * n)
      point2 = Math.floor(Math.random() * n)
    }
    if (point1 > point2) {
      [point1, point2] = [point2, point1]
    }

    let funcs = [
      (g, point1, point2) => {
        let temp = g[point1]
        g[point1] = g[point2]
        g[point2] = temp
      }, (g, point1, point2) => {
        // reverse
        let temp = g.slice(point1, point2).reverse()
        g.splice(point1, point2 - point1, ...temp)
      }, (g, point1, point2) => {
        // move
        let temp = g.splice(point1, point2 - point1)
        g.splice(Math.floor(Math.random() * g.length), 0, ...temp)
      }
    ]

    let random = Math.floor(Math.random() * funcs.length)
    funcs[random](gene, point1, point2)

    return gene
  }

  //get total distance in current route
  getDistance(order = null) {
    let distanceTotal = 0
    let { nodes } = this
    order.concat(order[0]).reduce((a, b) => {
      let currentDistance = Math.hypot((nodes[a].x - nodes[b].x), (nodes[a].y - nodes[b].y))
      distanceTotal += currentDistance
      
      return b
    })
    return distanceTotal
  }
 //get total distance for all route
  getEachDistance(order = null) {
    let distanceArr=[];
    let {nodes} = this;
    order.concat(order[0]).reduce((a,b) => {
      let currentDistance = (Math.hypot((nodes[a].x - nodes[b].x), (nodes[a].y - nodes[b].y))).toFixed(2)
      distanceArr.push(currentDistance)

      return b
    })
    return distanceArr
  }

  render() {
    let { ctx, nodes, deviceRatio } = this
    ctx.clearRect(0, 0, this.width * deviceRatio, this.height * deviceRatio)

    ctx.lineWidth = this.lw * deviceRatio
    ctx.strokeStyle = 'rgba(64, 64, 64, 0.2)'

    // draw lines
    this.orders.concat(this.orders[0]).reduce((a, b) => {
      let na = nodes[a]
      let nb = nodes[b]
      ctx.beginPath()
      ctx.moveTo(na.x * deviceRatio, na.y * deviceRatio)
      ctx.lineTo(nb.x * deviceRatio, nb.y * deviceRatio)
      ctx.stroke()
      let distance =  Math.hypot((na.x-nb.x), (na.y-nb.y))

      return b
    })

    //draw current route
    $('#path').html(this.orders.reduce(function (a, b) {
      return a.concat(b).concat(" => ");
    }, []).slice(0, -1))


    //distance to next
    $('#distance').html(this.getEachDistance(this.orders).reduce(function (a, b) {
      return a.concat(b).concat(" => ");
    }, []).slice(0, -1))

    //current total distance
    $('#total-distance').html((this.getDistance(this.orders)).toFixed(2))



    ctx.lineWidth = 1 * deviceRatio
    ctx.strokeStyle = '#900'
    ctx.fillStyle = '#000'
    ctx.font = ' bolder 15px arial '

    for (let i = 0; i < nodes.length; i++) {
      ctx.fillText(i, nodes[i].x, (nodes[i].y))
    }

    $('#gen').html(this.ga.generation)
    $('#mutation').html(this.ga.mutation_count)
  }

  async run() {
    let last_best_score = -1
    let last_best_gen = 0

    while (this.is_running) {
      this.orders = this.ga.next()

      let { best, generation } = this.ga

      if (last_best_score !== best.score) {
        last_best_score = best.score
        last_best_gen = generation
      } else if (generation - last_best_gen >= 5000) {
        this.stop()
        break
      }

      if (this.ga.generation % 10 === 0) {
        this.render()
      }
      await promise(1)
    }
  }

  start() {
    this.is_running = true
    this.run()
    if (typeof this._onstart === 'function') {
      this._onstart()
    }
  }

  stop() {
    this.is_running = false

    if (typeof this._onstop === 'function') {
      this._onstop()
    }
  }
}


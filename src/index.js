
import mainFuncApp from './mainFuncApp'

const WIDTH = 800
const HEIGHT = 600
var numberOfNodes = 10;

$( "#number-of-nodes" )
  .keyup(function() {
    numberOfNodes = parseInt($( this ).val());
  })
  .keyup();
// set numbers of nodes here ! 
$(document).ready(() => {
  if(numberOfNodes !== undefined) {
    salesman.makeRandomNodes(numberOfNodes)
  } else {
    salesman.makeRandomNodes(10)
  }
  

  salesman.render()
  $(window).resize(() => {
    $('#c').css({width: Math.min(WIDTH, screen.width) + 'px'})
  })
})

$('#btn-random').click(() => {
  salesman.stop()
  if(numberOfNodes !== undefined) {
    salesman.makeRandomNodes(numberOfNodes)
  } else {
    salesman.makeRandomNodes(10)
  }
  salesman.render()
})


//exemplo de uso de var, let e const em JavaScript
const externo = "Hello, I am a global constant!";

//declaração de uma variável usando var
function exemploVar() {
  if (true) {
    var mensagem = "Hello, Faculdade Descomplica! I am a var...";
  }
  console.log(mensagem);
}
//chamando a função exemploVar
exemploVar();

//declaração de uma variável usando let
function exemploLet() {
  if (true) {
    let mensagem = "Hi, Faculdade Descomplica! I am a let...";
    console.log(mensagem);
  }
}
//chamando função exemploLet
exemploLet();

//declaração de uma constante usando const
function exemploConstante() {
  const mensagem = "Hi, Faculdade Descomplica! I am a constant";
}
//chamando função exemploConst
exemploConstante();

//definindo função regular com dois parâmetros
function soma(a, b) {
  return a + b;
}
//chamando a função soma e armazenando o resultado em uma variável
let resultado = soma(13, 29);
//exibindo o resultado da função soma
console.log("O resultado da soma é: " + resultado);

// Define a label named 'outerLoop' for the following loop statement
outerLoop: for (let i = 0; i < 3; i++) {
  // Start inner loop with j from 0 to 2 for each value of i
  for (let j = 0; j < 3; j++) {
    // If i and j are strictly equal, break out of the labeled outer loop
    if (i === j) {
      break outerLoop; // exits the entire outerLoop (both loops stop)
    }
    // If the condition above is false, print the current i and j values
    console.log(`i: ${i}, j: ${j}`);
  }
}
// Execution continues here after the labeled loop is exited

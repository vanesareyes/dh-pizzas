//Modulo instalado de terceros
const inquirer = require('inquirer');//require es una función de node

//Modulo nativo
const fs = require('fs') //permite acceder a directorios dentro de mi pc

const rutaArchivo = __dirname + '/pedidos.json' //definimos la ubicación donde vamos a guardar los pedidos

let pedidos = fs.readFileSync(rutaArchivo, {encoding: 'utf8'}) // utf8 es una conversion de caracteres

pedidos = JSON.parse(pedidos) //convierto el string pedidos a un objeto de javascript(un array) xq quiero guardar mis pedidos en un array

//console.log(pedidos)

let opciones = [    //creo un array de 3 objetos literales vacios
    {
        name: 'para_llevar',
        type: 'confirm',
        message: '¿La pizza es para llevar?',
        default: false,
    },
    {
        name: 'direccion',
        type: 'input',
        message: 'Ingresa tu direccion',
        when: function (respuestas) {
            return respuestas.para_llevar
        },
        validate: function (respuesta) {
            if (respuesta.length < 5) {
                return 'Dejanos saber tu direccion para enviarte la pizza'
            }  //chequeo que escribió al menos 5 caracteres en la direccion

            return true
        },
    },
    {
        name: 'nombre',
        type: 'input',
        message: 'Ingresa tu nombre',
        validate: function (respuesta) {
            if (respuesta.length < 2) {
                return 'Decinos tu nombre por favor'
            }
            return true
        },
    },
    {
        name: 'telefono',
        type: 'input',
        message: 'Ingresa tu numero de telefono',
        validate: function (respuesta) {
            if (respuesta.length < 8 || isNaN(respuesta)) {
                return 'Decinos tu telefono por favor'
            }
            return true
        },
    },
    {
        name: 'gusto',
        type: 'rawlist',
        message: 'Elegi el gusto de la pizza', // tengo que darle una lista de opciones
        choices: ['Muzzarella', 'Jamon y Morron', 'Calabresa', '4 Quesos'],
        default: 'Muzzarella',
    },
    {
        name: 'tamanio',
        type: 'list',
        message: 'Elegi el tamaño de la pizza',
        choices: ['Personal', 'Mediana', 'Grande'],
        default: 'Grande',
    },

    {
        name: 'agregar_bebida',
        type: 'confirm',
        message: '¿Querés agregar una bebida?',
        default: false,
    },
    {
        name: 'bebida',
        type: 'list',
        message: 'Elegí el gusto de la bebida',
        choices: ['Cerveza rubia', 'Cerveza negra', 'Cola', 'Pomelo'],
        when: function (respuestas) {
            return respuestas.agregar_bebida
        },
    },
    {
        name: 'empanadas',
        type: 'checkbox',
        message: '¿Que gusto de empanadas queres?',
        choices: ['verdura', 'carne suave', 'carne picante', 'humita', 'jamon y queso', 'cebolla y queso'],
    },
    {
        name: 'cliente',
        type: 'confirm',
        message: '¿Sos cliente habitual?',
        default: false,
    },

];

let listaDeDescuentos = function () {
    return {
        'Individual': 3,
        'Mediana': 5,
        'Grande': 8
    }
}

let obtenerPrecioPizza = function (tamanio) {
    let precios = {
        'Individual': 430,
        'Mediana': 560,
        'Grande': 650
    }
    return precios[tamanio]
}

let obtenerDescuento = (tamanio, agregar_bebida, fnLista) => {
    if (!agregar_bebida) {
        return 0
    }
    let descuentos = fnLista()
    return descuentos[tamanio]
}

let fechaDelPedido = new Date();

//fecha.toLocaleString('en-US', {'hour12', true}).split(',')

inquirer
    .prompt(opciones) //llamamos a la librería inquirer y le pedimos que imprima en pantalla la interfaz con todas las opciones que le pusimos arriba
    .then(respuestas => {
        console.log('=== Resumen de tu pedido ===')
        console.log('Tus datos son - Nombre: ' + respuestas.nombre + ' / Teléfono: ' + respuestas.telefono)
      
        let precioDelivery = 0;
      
        if (respuestas.para_llevar) {
            precioDelivery = 20;
            console.log('Tu pedido será entregado en: ' + respuestas.direccion)
        } else {
            console.log('Nos indicaste que pasarás a retirar tu pedido')
        }
        console.log('=== Productos solicitados ===')
        console.log('Pizza: ' + respuestas.gusto)
        console.log('Tamanio:' + respuestas.tamanio)
        
        let precioBebida = 0;
        
        if (respuestas.agregar_bebida) {
            precioBebida = 80;
            console.log('Bebida:' + respuestas.bebida)
        }
        if (respuestas.cliente) {
            console.log('Tus tres empanadas de regalo serán de: ')
            console.log('Gusto verdura')
            console.log('Gusto humita')
            console.log('Gusto queso y cebolla')
        }
    
    let precioPizza = obtenerPrecioPizza(respuestas.tamanio);
    let descuento = obtenerDescuento(respuestas.tamanio, respuestas.agregar_bebida, listaDeDescuentos);

    console.log('El descuento es de ' + descuento + '%')
        
        console.log('Total delivery: ' + precioDelivery)
        
        let subtotal = precioPizza + precioBebida
        
        let descuentoFinal = (subtotal * descuento) / 100

        let precioFinal = subtotal - descuentoFinal + precioDelivery
        
        console.log('Subtotal: ' + subtotal)
        
        console.log('Descuento: ' + descuentoFinal)
        
        console.log('Total: ' + (subtotal - descuentoFinal + precioDelivery))
        
        // console.log('Fecha: ' + fecha.toLocaleDateString('en-US', {'hour12': true}))
        // console.log('Hora: ' + fecha.toLocaleTimeString('en-US', {'hour12': true}))

        let nuevos = {
            fecha: fechaDelPedido.toLocaleDateString('en-US', {'hour12': true}),
            hora: fechaDelPedido.toLocaleTimeString('en-US', {'hour12': true})
        }

        let final = {
            ...respuestas, 
            ...nuevos,
            totalProductos: precioFinal,
            descuento: descuentoFinal, 
            id: pedidos.length == 0 ? 1 : pedidos.length++
          
        }
        
        pedidos.push(final)
        
        pedidos = JSON.stringify(pedidos) //vuelvo a convertir el objeto a un string xq solo se pueden guardar strings en un archivo

        fs.writeFileSync(rutaArchivo, pedidos)

    })
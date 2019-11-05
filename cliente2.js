const inquirer = require('inquirer')
const rutaArchivo = __dirname + '/pedidos.json'

let pedidos = fs.readFileSync(rutaArchivo, {
    encoding: 'utf8'
})

pedidos = JSON.parse(pedidos)

let opciones = [{
    name: 'nombre',
    type: 'input',
    message: 'Ingresa tu nombre',
}, {
    name: 'telefono',
    type: 'input',
    message: 'Ingresa tu numero de telefono',
}, {
    name: 'gusto',
    type: 'rawlist',
    message: 'Elegi el gusto de la pizza',
    choices: ['Muzzarella', 'Jamon y Morron', 'Calabresa', '4 Quesos'],
}, {
    name: 'tamanio',
    type: 'list',
    message: 'Elegi el tamaño de la pizza',
    choices: ['Individual', 'Mediana', 'Grande'],
}, {
    name: 'con_bebida',
    type: 'confirm',
    default: false
}, {
    name: 'bebida',
    type: 'list',
    message: 'Elegi la bebida',
    choices: ['Coca', 'Sprite', 'Fanta', 'Agua'],
    when: function (respuesta) {
        return respuesta.con_bebida
    }
}, {
    name: 'gustos_de_empanadas',
    type: 'checkbox',
    message: 'Elegi los gustos de las empanadas',
    choices: ['Jamon y Queso', 'Cebolla y Queso', 'Caprese', 'Roquefort', 'Verdura', 'Humita'],
}, {
    name: 'para_llevar',
    type: 'confirm',
    message: 'La pizza es para llevar ?',
    default: false
}, {
    name: 'direccion',
    type: 'input',
    message: 'Ingresa tu direccion',
    when: function (respuestas) {
        return respuestas.para_llevar
    },
    validate: function (respuesta) {
        if (respuesta.length < 5) {
            return 'Dejanos saber tu direccion para enviarte la pizza'
        }
        return true
    }
}, {
    name: 'cliente_habitual',
    type: 'confirm',
    default: false
}]

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

let obtenerDescuento = (tamanio, conBebida, fnLista) => {
    if (!conBebida) {
        return 0
    }
    let descuentos = fnLista()
    return descuentos[tamanio]
}

inquirer.prompt(opciones)
    .then(function (respuestas) {
        console.log(respuestas)
        console.log('=== Resumen de tu pedido ===') console.log('Tus datos son - Nombre: ' + respuestas.nombre + ' / Teléfono: ' + respuestas.telefono)

        let precioDelivery = 0;

        if (respuestas.para_llevar) {
            precioDelivery = 20;
            console.log('Tu pedido será entregado en: ' + respuestas.direccion)
        } else {
            console.log('Nos indicaste que pasarás a retirar tu pedido')
        }

        console.log('=== Productos solicitados ===') console.log('Pizza: ' + respuestas.gusto) console.log('Tamaño: ' + respuestas.tamanio)

        let precioBebida = 0

        if (respuestas.con_bebida) {
            precioBebida = 80 console.log('Bebida: ' + respuestas.bebida)
        }

        if (respuestas.cliente_habitual) {
            console.log('Tus tres empanadas de regalo serán de:') console.log('Jamon y Queso') console.log('Cebolla y Queso') console.log('Muzarella')
        }

        let precioPizza = obtenerPrecioPizza(respuestas.tamanio);

        let descuento = obtenerDescuento(respuestas.tamanio, respuestas.con_bebida, listaDeDescuentos)

        console.log('El descuento es de ' + descuento + '%')
        console.log('Total delivery: ' + precioDelivery)

        let subtotal = precioPizza + precioBebida
        let descuentoFinal = (subtotal * descuento) / 100
        let precioFinal = (subtotal - descuentoFinal + precioDelivery)

        console.log('Subtotal: ' + subtotal)
        console.log('Descuento: ' + descuentoFinal)
        console.log('Total: ' + precioFinal)

        let fechaDelPedido = new Date

        let nuevos = {
            fecha: fechaDelPedido.toLocaleDateString('en-US', {
                'hour12': true
            }),
            hora: fechaDelPedido.toLocaleTimeString('en-US', {
                'hour12': true
            }),
        }

        let final = {
            ...respuestas,
            ...nuevos,
            totalProductos: precioFinal,
            descuento: descuentoFinal,
            id: pedidos.length == 0 ? 1 : ++pedidos.length
        }

        pedidos.push(final)
        pedidos = JSON.stringify(pedidos)
        fs.writeFileSync(rutaArchivo, pedidos)
    })

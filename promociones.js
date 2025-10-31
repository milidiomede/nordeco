// Precios de los productos extraídos de productos.html
// Nota: La clave se usa para mostrar en el select, y el valor es el precio unitario.
const PRODUCT_DATA = {
    'Florero Pop Amarillo ($15.500)': 15500,
    'Lámpara de Escritorio ($28.900)': 28900,
    'Manta de Algodón ($45.000)': 45000,
    'Bowls Mamushka ($25.800)': 25800,
    'Servilletas de lino ($10.500)': 10500
};

/**
 * Función que maneja la lógica de cálculo para las tres promociones.
 * @param {string} tipo - El tipo de promoción ('monto75k', 'primeracompra', 'bowls')
 * @param {string} idProductoSelect - ID del elemento SELECT que contiene el precio del producto
 * @param {string} idCantidad - ID del input de cantidad de productos
 * @param {string} idResultado - ID del div donde mostrar los resultados
 */
function calcularPromocion(tipo, idProductoSelect, idCantidad, idResultado) {
    // 1. Obtener valores y validación
    const productoSelect = document.getElementById(idProductoSelect);
    const precioUnitario = parseFloat(productoSelect.value); // El valor del SELECT es el precio
    
    // Obtener el nombre del producto seleccionado
    const productoNombreCompleto = productoSelect.options[productoSelect.selectedIndex].text;
    const productoNombre = productoNombreCompleto.split('(')[0].trim();
    
    const cantidad = parseInt(document.getElementById(idCantidad).value);
    const resultadoDiv = document.getElementById(idResultado);

    if (isNaN(precioUnitario) || isNaN(cantidad) || precioUnitario <= 0 || cantidad <= 0) {
        // Asegurar que el select no esté en la opción por defecto
        if (precioUnitario === 0) {
             resultadoDiv.querySelector('.mensaje-amigable').innerHTML = "Por favor, **selecciona un producto** y una cantidad válida.";
        }
        return;
    }

    const totalSinDescuento = precioUnitario * cantidad;
    let descuento = 0;
    let mensajeAhorro = '';

    // 2. Lógica de las promociones (Switch case)
    switch (tipo) {
        case 'monto75k':
            // "25% OFF en compras mayores a $75.000"
            const montoMinimo75k = 75000;
            if (totalSinDescuento > montoMinimo75k) {
                descuento = totalSinDescuento * 0.25; // 25% del total
                mensajeAhorro = `¡Felicidades! Tu compra total de ${productoNombre} superó los $${montoMinimo75k.toLocaleString('es-AR')} y ganaste un **25% extra**.`;
            } else {
                mensajeAhorro = `Te faltan **$${(montoMinimo75k - totalSinDescuento).toLocaleString('es-AR', { minimumFractionDigits: 0 })}** para ganar el 25% OFF.`;
            }
            break;

        case 'primeracompra':
            // "15% de Descuento en tu primera compra"
            descuento = totalSinDescuento * 0.15; // 15% del total
            mensajeAhorro = `¡Disfruta de tu **15% de descuento** en el/los ${productoNombre} por ser nuevo cliente!`;
            break;

        case 'bowls':
            // "2x1 en los Bowls Mamushka"
            // Esta promoción solo aplica si el producto seleccionado es el Bowls Mamushka
            if (productoNombre.includes('Bowls Mamushka') && cantidad >= 2) {
                // Por cada 2, uno es gratis (el de menor precio, que es el unitario aquí)
                const productosGratis = Math.floor(cantidad / 2);
                descuento = productosGratis * precioUnitario;
                mensajeAhorro = `¡Tu ahorro es equivalente a **${productosGratis} Bowl(s) Mamushka gratis**!`;
            } else if (productoNombre.includes('Bowls Mamushka') && cantidad < 2) {
                mensajeAhorro = `Necesitas **2 Bowls** para aplicar esta oferta 2x1.`;
            } else {
                 mensajeAhorro = `Esta promoción 2x1 solo es válida para los **Bowls Mamushka**.`;
            }
            break;
    }

    // 3. Cálculo Final
    const totalFinal = totalSinDescuento - descuento;
    
    // 4. Formato de Moneda (sin decimales, más limpio)
    const format = (value) => `$${Math.round(value).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;

    // 5. Mostrar resultados
    resultadoDiv.querySelector('[data-sin-descuento]').textContent = format(totalSinDescuento);
    resultadoDiv.querySelector('[data-descuento]').textContent = format(descuento);
    resultadoDiv.querySelector('[data-total-final]').textContent = format(totalFinal);
    resultadoDiv.querySelector('.mensaje-amigable').innerHTML = mensajeAhorro;

    // Resaltar el resultado si hubo descuento
    if (descuento > 0) {
        resultadoDiv.style.backgroundColor = 'var(--borde)'; 
        resultadoDiv.style.borderColor = 'var(--primario)';
    } else {
        resultadoDiv.style.backgroundColor = 'transparent';
        resultadoDiv.style.borderColor = 'var(--borde)';
    }
}

/**
 * Función que inicializa: llena los SELECT de productos y maneja la precarga de URL
 */
function initializePromotions() {
    const selectIds = ['p1-producto', 'p2-producto', 'p3-producto'];
    
    // 1. Llenar los SELECTs con los productos
    selectIds.forEach(id => {
        const selectElement = document.getElementById(id);
        if (selectElement) {
             // Agrega una opción por defecto
            const defaultOption = document.createElement('option');
            defaultOption.value = '0';
            defaultOption.textContent = '--- Selecciona un Producto ---';
            selectElement.appendChild(defaultOption);

            // Llena con los datos reales
            for (const name in PRODUCT_DATA) {
                const option = document.createElement('option');
                option.value = PRODUCT_DATA[name];
                option.textContent = name;
                selectElement.appendChild(option);
            }
            // Agrega un listener para calcular automáticamente al cambiar el producto o la cantidad
            const promoIndex = id.split('-')[0]; // p1, p2, p3
            const promoType = (promoIndex === 'p1') ? 'monto75k' : (promoIndex === 'p2') ? 'primeracompra' : 'bowls';

            // Listener para el selector de producto
            selectElement.addEventListener('change', () => {
                // Si cambia el producto, calcula la promoción
                calcularPromocion(promoType, id, `${promoIndex}-cantidad`, `${promoIndex}-resultado`);
            });
            // Listener para el input de cantidad
            document.getElementById(`${promoIndex}-cantidad`).addEventListener('input', () => {
                 // Si cambia la cantidad, calcula la promoción
                calcularPromocion(promoType, id, `${promoIndex}-cantidad`, `${promoIndex}-resultado`);
            });
        }
    });

    // 2. Manejar la precarga desde productos.html (URL parameters)
    const urlParams = new URLSearchParams(window.location.search);
    const producto = urlParams.get('producto');
    const precio = urlParams.get('precio');

    if (producto && precio) {
        // Asumimos que la redirección desde productos.html se relaciona con la "Primera Compra" (p2)
        const selectElement = document.getElementById('p2-producto');

        if (selectElement) {
            // Recorre las opciones para encontrar la que coincide con el precio
            let optionToSelect = null;
            for (let i = 0; i < selectElement.options.length; i++) {
                if (selectElement.options[i].value === precio) {
                    optionToSelect = selectElement.options[i].value;
                    break;
                }
            }
            
            if (optionToSelect) {
                selectElement.value = optionToSelect; 
                document.getElementById('p2-cantidad').value = 1;
                
                // Actualizar el mensaje y ejecutar el cálculo inicial
                const mensaje = document.getElementById('p2-resultado').querySelector('.mensaje-amigable');
                mensaje.innerHTML = `¡Estás simulando la promo con tu **${producto}**! Modifica la cantidad para calcular.`;
                
                // Ejecutar el cálculo
                calcularPromocion('primeracompra', 'p2-producto', 'p2-cantidad', 'p2-resultado');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', initializePromotions);
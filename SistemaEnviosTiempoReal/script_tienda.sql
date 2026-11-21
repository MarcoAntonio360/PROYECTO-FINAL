IF DB_ID('TiendaOnline') IS NULL
    CREATE DATABASE TiendaOnline;
GO

USE TiendaOnline;
GO

CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
    telefono VARCHAR(20) NULL,
    direccion VARCHAR(200) NULL,
    CONSTRAINT ck_usuarios_rol CHECK (rol IN ('cliente', 'administrador'))
);

CREATE TABLE categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200) NULL
);

CREATE TABLE productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300) NULL,
    precio DECIMAL(10,2) NOT NULL,
    existencia INT NOT NULL DEFAULT 0,
    imagen VARCHAR(200) NULL,
    id_categoria INT NOT NULL,
    CONSTRAINT fk_productos_categorias FOREIGN KEY (id_categoria) REFERENCES categorias(id),
    CONSTRAINT ck_productos_precio CHECK (precio >= 0),
    CONSTRAINT ck_productos_existencia CHECK (existencia >= 0)
);

CREATE TABLE pedidos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT GETDATE(),
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'En Recolección',
    direccion_entrega VARCHAR(200) NOT NULL,
    latitud_destino DECIMAL(9,6) NOT NULL,
    longitud_destino DECIMAL(9,6) NOT NULL,
    indice_actual INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_pedidos_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    CONSTRAINT ck_pedidos_estado CHECK (estado IN ('En Recolección', 'En Distribución', 'Entregado'))
);

CREATE TABLE detalle_pedidos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_pedidos FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
    CONSTRAINT fk_detalle_productos FOREIGN KEY (id_producto) REFERENCES productos(id),
    CONSTRAINT ck_detalle_cantidad CHECK (cantidad > 0)
);
GO

INSERT INTO usuarios (nombre, correo, contrasena, rol, telefono, direccion) VALUES
('Administrador', 'admin@tienda.com', CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'admin123'), 2), 'administrador', '2310000001', 'Calle Reforma 10, Centro'),
('Ana López', 'ana@correo.com', CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'cliente123'), 2), 'cliente', '2310000002', 'Calle Hidalgo 25, Centro'),
('Luis Pérez', 'luis@correo.com', CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'cliente123'), 2), 'cliente', '2310000003', 'Av. Juárez 118, Centro');

INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica', 'Accesorios y dispositivos electrónicos'),
('Hogar', 'Artículos para el hogar'),
('Ropa', 'Prendas de vestir'),
('Deportes', 'Artículos deportivos');

INSERT INTO productos (nombre, descripcion, precio, existencia, imagen, id_categoria) VALUES
('Audífonos Bluetooth', 'Audífonos inalámbricos con micrófono', 450.00, 25, 'audifonos.jpg', 1),
('Teclado Mecánico', 'Teclado con iluminación RGB', 890.00, 15, 'teclado.jpg', 1),
('Mouse Inalámbrico', 'Mouse ergonómico de 1600 DPI', 250.00, 40, 'mouse.jpg', 1),
('Bocina Portátil', 'Bocina resistente al agua', 650.00, 20, 'bocina.jpg', 1),
('Lámpara de Escritorio', 'Lámpara LED con brazo flexible', 320.00, 30, 'lampara.jpg', 2),
('Cafetera Eléctrica', 'Cafetera de 12 tazas', 780.00, 12, 'cafetera.jpg', 2),
('Juego de Sábanas', 'Sábanas de algodón matrimonial', 540.00, 18, 'sabanas.jpg', 2),
('Playera de Algodón', 'Playera lisa unisex', 180.00, 50, 'playera.jpg', 3),
('Sudadera con Capucha', 'Sudadera afelpada', 420.00, 35, 'sudadera.jpg', 3),
('Gorra Deportiva', 'Gorra ajustable', 150.00, 45, 'gorra.jpg', 3),
('Balón de Fútbol', 'Balón número 5', 350.00, 22, 'balon.jpg', 4),
('Tapete para Yoga', 'Tapete antiderrapante', 280.00, 28, 'tapete.jpg', 4);

INSERT INTO pedidos (id_usuario, fecha, total, estado, direccion_entrega, latitud_destino, longitud_destino, indice_actual) VALUES
(2, DATEADD(DAY, -10, GETDATE()), 950.00, 'Entregado', 'Calle Hidalgo 25, Centro', 19.823000, -97.359000, 2),
(2, DATEADD(DAY, -3, GETDATE()), 780.00, 'En Distribución', 'Calle Hidalgo 25, Centro', 19.823000, -97.359000, 1),
(3, DATEADD(DAY, -1, GETDATE()), 780.00, 'En Recolección', 'Av. Juárez 118, Centro', 19.811500, -97.372000, 0),
(3, DATEADD(DAY, -6, GETDATE()), 780.00, 'Entregado', 'Av. Juárez 118, Centro', 19.811500, -97.372000, 2);

INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 450.00, 450.00),
(1, 3, 2, 250.00, 500.00),
(2, 8, 2, 180.00, 360.00),
(2, 9, 1, 420.00, 420.00),
(3, 6, 1, 780.00, 780.00),
(4, 11, 1, 350.00, 350.00),
(4, 12, 1, 280.00, 280.00),
(4, 10, 1, 150.00, 150.00);
GO

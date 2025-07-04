import { useState, useEffect } from 'react';
import axios from 'axios';

const Agenda = () => {
    const [contactos, setContactos] = useState([]);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarContactos();
    }, []);

    const cargarContactos = async () => {
        try {
            console.log('Cargando contactos...');
            const res = await axios.get('http://localhost:5000/contactos');
            console.log('Contactos cargados:', res.data);
            setContactos(res.data);
            setError('');
        } catch (error) {
            console.error('Error al cargar contactos:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            setError('Error al cargar contactos: ' + (error.response?.data?.error || error.message));
        }
    };

    const agregarContacto = async () => {
        // Validación básica
        if (!nombre.trim() || !telefono.trim()) {
            setError('Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Agregando contacto:', { nombre, telefono });
            const res = await axios.post('http://localhost:5000/contactos', { nombre, telefono });
            console.log('Contacto agregado:', res.data);
            
            setContactos([...contactos, res.data]);
            setNombre('');
            setTelefono('');
        } catch (error) {
            console.error('Error al agregar contacto:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            setError('Error al agregar contacto: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const eliminarContacto = async (id) => {
        try {
            console.log('Eliminando contacto ID:', id);
            await axios.delete(`http://localhost:5000/contactos/${id}`);
            console.log('Contacto eliminado');
            setContactos(contactos.filter(c => c.id !== id));
            setError('');
        } catch (error) {
            console.error('Error al eliminar contacto:', error);
            setError('Error al eliminar contacto: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Agenda de Contactos</h1>
            
            {error && (
                <div style={{ color: 'red', marginBottom: '10px', padding: '10px', border: '1px solid red' }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Nombre" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <input 
                    type="text" 
                    placeholder="Teléfono" 
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <button 
                    onClick={agregarContacto} 
                    disabled={loading}
                    style={{ padding: '5px 10px' }}
                >
                    {loading ? 'Agregando...' : 'Agregar'}
                </button>
            </div>

            <ul>
                {contactos.map(c => (
                    <li key={c.id} style={{ marginBottom: '10px' }}>
                        {c.nombre} - {c.telefono}
                        <button 
                            onClick={() => eliminarContacto(c.id)}
                            style={{ marginLeft: '10px', padding: '2px 8px' }}
                        >
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Agenda;
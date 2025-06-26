import { useState } from 'react';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', { email, contraseña });
            localStorage.setItem('token', response.data.token);
            alert('Login exitoso');
        } catch (error) {
            alert('Error en login');
        }
    };

    return (
        <div>
            <div style={{color:'red',textAlign:'center'}}>
                <h1>LOGIN</h1>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <br />
                <input type="password" placeholder="Contraseña" onChange={(e) => setContraseña(e.target.value)} />
                <br />
                <button onClick={handleLogin}>Iniciar sesión</button>
            </div>
        </div>
    );
}

export default Login;
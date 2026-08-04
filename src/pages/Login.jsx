import React, { useState } from 'react';
import { login } from "../Api/Auth/apiLogin";

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.usuario.trim() || !formData.contrasena.trim()) {
      setError('Por favor, complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await login(formData.usuario, formData.contrasena);
      
      console.log('Respuesta completa:', response);
      
     
      if (response.token) {
        sessionStorage.setItem('token', response.token);
      }
      
     
     if (response.usuario) {
  sessionStorage.setItem('user', JSON.stringify({
    usuario: response.usuario.usuario 
  }));
} else if (response.user && response.user.usuario) {
  sessionStorage.setItem('user', JSON.stringify({
    usuario: response.user.usuario
  }));
} else {
  sessionStorage.setItem('user', JSON.stringify({
    usuario: formData.usuario
  }));
}
      
      setSuccess('Inicio de sesión exitoso');
      setTimeout(() => {
        window.location.href = '/home';
      }, 1500);
      
    } catch (err) {
      console.error('Error de login:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <style>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-500 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-slideIn">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm font-medium flex-1">{error}</span>
              <button 
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-slideIn">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 text-sm font-medium flex-1">{success}</span>
              <button 
                onClick={() => setSuccess('')}
                className="text-green-400 hover:text-green-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder=" "
              disabled={loading}
              className="w-full px-4 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-300 peer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label className="absolute left-4 text-gray-500 text-sm transition-all duration-300 transform -translate-y-7 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-black bg-white px-1">
              Usuario
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder=" "
              disabled={loading}
              className="w-full px-4 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-300 peer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label className="absolute left-4 text-gray-500 text-sm transition-all duration-300 transform -translate-y-7 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-black bg-white px-1">
              Contraseña
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
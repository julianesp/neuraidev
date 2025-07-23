"use client";

import { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import Link from "next/link";

export default function BusinessSignupPage() {
  const { isAuthenticated, user } = useUserAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    categoryId: ""
  });

  useEffect(() => {
    fetchCategorias();
    fetchPlans();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/subscription-plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para registrar tu negocio");
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("/api/business/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          planId: selectedPlan?.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirigir a página de pago o dashboard
        if (selectedPlan) {
          window.location.href = `/business/payment?businessId=${data.business.id}&planId=${selectedPlan.id}`;
        } else {
          alert("¡Negocio registrado! Comenzó tu trial de 14 días.");
          window.location.href = "/business/dashboard";
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Requerido
            </h1>
            <p className="text-gray-600 mb-6">
              Debes tener una cuenta para registrar tu negocio
            </p>
            <div className="space-y-3">
              <Link 
                href="/login"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Registra tu Negocio
          </h1>
          <p className="text-lg text-gray-600">
            Comienza con 14 días gratis y llega a más clientes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-16">
            <span className="text-sm text-gray-600">Información</span>
            <span className="text-sm text-gray-600">Plan</span>
            <span className="text-sm text-gray-600">Confirmación</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Información del Negocio
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({...prev, businessName: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Mi Negocio S.A.S"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData(prev => ({...prev, businessType: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tienda, Restaurante, Servicio, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email del Negocio *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="contacto@minegocio.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({...prev, categoryId: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.name} value={categoria.name}>
                        {categoria.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://minegocio.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Calle 123 #45-67, Bogotá"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe tu negocio..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.businessName || !formData.businessType || !formData.email || !formData.categoryId}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Elige tu Plan
              </h2>

              {/* Trial Option */}
              <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      🎉 Prueba Gratis - 14 Días
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Comienza sin costo alguno. Hasta 10 productos incluidos.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPlan === null
                        ? "bg-green-600 text-white"
                        : "bg-white text-green-600 border border-green-600"
                    }`}
                  >
                    {selectedPlan === null ? "Seleccionado" : "Seleccionar"}
                  </button>
                </div>
              </div>

              {/* Paid Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedPlan?.id === plan.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-3xl font-bold text-blue-600 mb-4">
                      ${new Intl.NumberFormat('es-CO').format(plan.price)}
                      <span className="text-sm text-gray-600 font-normal">/mes</span>
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {JSON.parse(plan.features || '[]').map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        selectedPlan?.id === plan.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {selectedPlan?.id === plan.id ? "Seleccionado" : "Seleccionar"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Volver
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Confirmación
              </h2>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Información del Negocio</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Nombre:</strong> {formData.businessName}</div>
                    <div><strong>Tipo:</strong> {formData.businessType}</div>
                    <div><strong>Email:</strong> {formData.email}</div>
                    <div><strong>Categoría:</strong> {categorias.find(c => c.name === formData.categoryId)?.display_name}</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Plan Seleccionado</h3>
                  {selectedPlan ? (
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {selectedPlan.name} - ${new Intl.NumberFormat('es-CO').format(selectedPlan.price)}/mes
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Comenzará después del período de prueba de 14 días
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        Prueba Gratis - 14 Días
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Sin compromisos. Puedes actualizar en cualquier momento.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Volver
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Crear mi Negocio"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// src/components/auth/ProviderSignup.js
'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ProviderSignup() {
  const [formData, setFormData] = useState({
    // Basic Info
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Location & Services
    location: '',
    catersTo: 'both',
    gender: '',
    age: '',
    bodyType: '',
    height: '',
    ethnicity: '',
    cupSize: '',
    hairColor: '',
    shoeSize: '',
    eyeColor: '',
    languages: ['English'],
    
    // Availability
    availability: {
      monday: 'all-day',
      tuesday: 'all-day',
      wednesday: 'all-day',
      thursday: 'all-day',
      friday: 'all-day',
      saturday: 'all-day',
      sunday: 'all-day'
    },
    
    // Pricing
    incallPrice: '',
    outcallPrice: '',
    
    // Contact
    website: '',
    
    agreeToTerms: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const locations = [
    'Miami, Florida, United States',
    'Los Angeles, California, United States',
    'Las Vegas, Nevada, United States',
    'New York, New York, United States',
    'Chicago, Illinois, United States'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    setError('');
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.displayName || !formData.email || !formData.password) {
          return 'Please fill in all required fields';
        }
        if (formData.password.length < 8) {
          return 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          return 'Passwords do not match';
        }
        break;
      case 2:
        if (!formData.location || !formData.gender || !formData.age) {
          return 'Please fill in all required profile information';
        }
        break;
      default:
        break;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the platform policies');
      return;
    }

    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (currentStep < 4) {
      nextStep();
      return;
    }

    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        userType: 'provider',
        ...formData,
        createdAt: new Date(),
        lastActive: new Date(),
        profileComplete: true,
        verified: false // Will need manual verification
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Provider signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Display Name *</label>
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 transition duration-200"
          placeholder="Your professional name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 transition duration-200"
          placeholder="your@email.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 transition duration-200"
            placeholder="Minimum 8 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 transition duration-200"
            placeholder="Confirm your password"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Profile Details
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Based In *</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 transition duration-200"
        >
          <option value="">Select your location</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Caters To *</label>
        <select
          name="catersTo"
          value={formData.catersTo}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 transition duration-200"
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 transition duration-200"
          >
            <option value="">Select</option>
            <option value="woman">Woman (She/Her)</option>
            <option value="man">Man (He/Him)</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Age *</label>
          <select
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 transition duration-200"
          >
            <option value="">Select</option>
            <option value="18-25">18-25</option>
            <option value="26-30">26-30</option>
            <option value="31-35">31-35</option>
            <option value="36-40">36-40</option>
            <option value="41+">41+</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Body Type</label>
          <select
            name="bodyType"
            value={formData.bodyType}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 transition duration-200"
          >
            <option value="">Select</option>
            <option value="petite">Petite</option>
            <option value="athletic">Athletic</option>
            <option value="curvy">Curvy</option>
            <option value="voluptuous">Voluptuous</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Height</label>
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 transition duration-200"
            placeholder="169 cm / 5'7"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Incall Price (1H)</label>
          <input
            type="text"
            name="incallPrice"
            value={formData.incallPrice}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 transition duration-200"
            placeholder="US$275"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Outcall Price (1H)</label>
          <input
            type="text"
            name="outcallPrice"
            value={formData.outcallPrice}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 transition duration-200"
            placeholder="US$320"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Availability</label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(formData.availability).map(([day, value]) => (
            <div key={day} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
              <span className="text-pink-200 capitalize">{day}</span>
              <select
                value={value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  availability: { ...prev.availability, [day]: e.target.value }
                }))}
                className="bg-transparent text-pink-200 border-none focus:outline-none"
              >
                <option value="all-day">All day</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="not-available">Not available</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Website/Contact</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 transition duration-200"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="agreeToTerms"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="w-4 h-4 text-pink-500 bg-black/20 border-pink-500/30 rounded focus:ring-pink-400"
        />
        <label htmlFor="agreeToTerms" className="ml-2 text-sm text-pink-200">
          I agree to the platform policies and confirm I am over 18 years old.
        </label>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Basic Info', component: renderStep1 },
    { number: 2, title: 'Profile Details', component: renderStep2 },
    { number: 3, title: 'Pricing & Availability', component: renderStep3 },
    { number: 4, title: 'Final Details', component: renderStep4 }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-pink-500 border-pink-500 text-white' 
                : 'border-pink-500/30 text-pink-500/30'
            }`}>
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                currentStep > step.number ? 'bg-pink-500' : 'bg-pink-500/30'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Current Step Content */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">{steps[currentStep - 1].title}</h3>
        {steps[currentStep - 1].component()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-pink-500/50 text-pink-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-500/10 transition duration-200"
        >
          Previous
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition duration-200 disabled:opacity-50"
        >
          {currentStep === 4 
            ? (loading ? 'Creating Account...' : 'Complete Registration') 
            : 'Next Step'
          }
        </button>
      </div>
    </form>
  );
}

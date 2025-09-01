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
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
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
        if (!formData.displayName?.trim()) {
          return 'Display name is required';
        }
        if (!formData.email?.trim()) {
          return 'Email address is required';
        }
        if (!formData.password) {
          return 'Password is required';
        }
        if (formData.password.length < 8) {
          return 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          return 'Passwords do not match';
        }
        break;
      case 2:
        if (!formData.location) {
          return 'Please select your location';
        }
        if (!formData.gender) {
          return 'Please select your gender';
        }
        if (!formData.age) {
          return 'Please select your age range';
        }
        break;
      case 3:
        if (!formData.incallPrice?.trim()) {
          return 'Incall price is required';
        }
        if (!formData.outcallPrice?.trim()) {
          return 'Outcall price is required';
        }
        break;
      case 4:
        if (!formData.agreeToTerms) {
          return 'You must agree to the platform policies';
        }
        break;
      default:
        break;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only check terms agreement on the final step
    if (currentStep === 4 && !formData.agreeToTerms) {
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

    // Final submission
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Prepare user data for Firestore
      const userData = {
        userType: 'provider',
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        location: formData.location,
        catersTo: formData.catersTo,
        gender: formData.gender,
        age: formData.age,
        bodyType: formData.bodyType,
        height: formData.height,
        ethnicity: formData.ethnicity,
        cupSize: formData.cupSize,
        hairColor: formData.hairColor,
        shoeSize: formData.shoeSize,
        eyeColor: formData.eyeColor,
        languages: formData.languages,
        availability: formData.availability,
        incallPrice: formData.incallPrice,
        outcallPrice: formData.outcallPrice,
        website: formData.website,
        agreeToTerms: formData.agreeToTerms,
        createdAt: new Date(),
        lastActive: new Date(),
        profileComplete: true,
        verified: false
      };

      // Remove empty fields
      Object.keys(userData).forEach(key => {
        if (userData[key] === '' || userData[key] === null || userData[key] === undefined) {
          delete userData[key];
        }
      });
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Provider signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
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
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
          placeholder="Your professional name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
          placeholder="your@email.com"
          required
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
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            placeholder="Minimum 8 characters"
            required
            minLength="8"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            placeholder="Confirm your password"
            required
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
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
          required
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
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            required
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
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            required
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Body Type</label>
          <select
            name="bodyType"
            value={formData.bodyType}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
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
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            placeholder="169 cm / 5'7&quot;"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Ethnicity</label>
          <input
            type="text"
            name="ethnicity"
            value={formData.ethnicity}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            placeholder="Mixed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Hair Color</label>
          <input
            type="text"
            name="hairColor"
            value={formData.hairColor}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            placeholder="Brunette"
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Pricing & Availability
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Incall Price (1H) *</label>
          <input
            type="text"
            name="incallPrice"
            value={formData.incallPrice}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            placeholder="US$275"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-2">Outcall Price (1H) *</label>
          <input
            type="text"
            name="outcallPrice"
            value={formData.outcallPrice}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
            placeholder="US$320"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Availability</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {Object.entries(formData.availability).map(([day, value]) => (
            <div key={day} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-pink-500/20">
              <span className="text-pink-200 capitalize font-medium">{day}</span>
              <select
                value={value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  availability: { ...prev.availability, [day]: e.target.value }
                }))}
                className="bg-black/30 text-pink-200 border border-pink-500/30 rounded px-2 py-1 focus:outline-none focus:border-pink-400"
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

  // Step 4: Final Details
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-pink-200 mb-2">Website/Contact</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition duration-200"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div className="flex items-start space-x-3 p-4 bg-black/20 rounded-xl border border-pink-500/20">
        <input
          type="checkbox"
          id="agreeToTerms"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="w-4 h-4 text-pink-500 bg-black/20 border-pink-500/30 rounded focus:ring-pink-400 focus:ring-2 mt-1 flex-shrink-0"
          required
        />
        <label htmlFor="agreeToTerms" className="text-sm text-pink-200 leading-relaxed">
          I agree to the platform policies and confirm that I am over the age of 18 and the age of majority in my jurisdiction. I understand that my profile will be reviewed and verified before being published.
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
      {/* Progress Steps - Mobile Responsive */}
      <div className="mb-8">
        {/* Mobile View - Compact */}
        <div className="block md:hidden">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-pink-300">
              Step {currentStep} of {steps.length}
            </div>
            <div className="text-sm text-pink-200 font-medium">
              {steps[currentStep - 1].title}
            </div>
          </div>
          <div className="w-full bg-pink-500/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Desktop View - Full Steps */}
        <div className="hidden md:flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                currentStep >= step.number 
                  ? 'bg-pink-500 border-pink-500 text-white shadow-lg' 
                  : 'border-pink-500/30 text-pink-500/30'
              }`}>
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                  currentStep > step.number ? 'bg-pink-500' : 'bg-pink-500/30'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm animate-pulse">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Current Step Content */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 hidden md:block">
          {steps[currentStep - 1].title}
        </h3>
        {steps[currentStep - 1].component()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 space-x-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1 || loading}
          className="px-6 py-3 border border-pink-500/50 text-pink-300 rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-500/10 transition duration-200 flex-1 md:flex-none"
        >
          Previous
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition duration-200 disabled:opacity-50 flex-1 md:flex-none"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : currentStep === 4 ? (
            'Complete Registration'
          ) : (
            'Next Step'
          )}
        </button>
      </div>
    </form>
  );
}
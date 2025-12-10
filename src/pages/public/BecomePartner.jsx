import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { 
  Building2, CheckCircle, Users, DollarSign, BookOpen, 
  Award, ArrowRight, Phone, Mail, MapPin, Send
} from 'lucide-react';

function BecomePartner() {
  const [formData, setFormData] = useState({
    centerName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    message: ''
  });

  const benefits = [
    { icon: BookOpen, title: 'Ready-Made Curriculum', description: 'Access our complete Cambridge IGCSE and Islamic Studies curriculum' },
    { icon: Users, title: 'Student Management', description: 'Use our platform for enrollment, progress tracking, and assessments' },
    { icon: DollarSign, title: 'Revenue Sharing', description: 'Flexible partnership models with competitive revenue splits' },
    { icon: Award, title: 'Training & Support', description: 'Comprehensive teacher training and ongoing operational support' },
  ];

  const steps = [
    { num: 1, title: 'Apply', description: 'Submit your application with center details' },
    { num: 2, title: 'Review', description: 'Our team reviews your application within 5 days' },
    { num: 3, title: 'Agreement', description: 'Sign partnership agreement and configure terms' },
    { num: 4, title: 'Launch', description: 'Get trained and start enrolling students' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Application submitted! We will contact you within 5 business days.');
  };

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Become a TABSERA Learning Center
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Join our growing network of educational partners across East Africa. 
            Bring world-class Cambridge IGCSE and Islamic Studies programs to your community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#apply" className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg transition-colors">
              Apply Now
            </a>
            <Link to="/centers" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
              View Existing Centers
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Why Partner with TABSERA?</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            We provide everything you need to run a successful learning center
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <benefit.icon size={32} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Partnership Models</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Flexible revenue sharing arrangements to suit your needs
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <h3 className="font-bold text-gray-900 mb-2">Standard Partner</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">50/50</div>
              <p className="text-sm text-gray-500 mb-4">Revenue Split</p>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Full curriculum access</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Teacher training</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Student platform</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-blue-500 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Premium Partner</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">40/60</div>
              <p className="text-sm text-gray-500 mb-4">You Keep 60%</p>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Everything in Standard</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Priority support</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Marketing support</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <h3 className="font-bold text-gray-900 mb-2">Custom</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">Flexible</div>
              <p className="text-sm text-gray-500 mb-4">Negotiated Terms</p>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Custom revenue split</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Per-track pricing</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" />Enterprise features</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>

          <div className="flex flex-col md:flex-row justify-between items-start max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 text-center relative">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-blue-200" style={{ transform: 'translateX(50%)' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Apply to Partner</h2>
          <p className="text-gray-600 text-center mb-8">
            Fill out the form below and we'll get back to you within 5 business days
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Center/School Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.centerName}
                  onChange={(e) => setFormData({...formData, centerName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="e.g., Al-Hikma Academy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <input 
                  type="text" 
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="+252 63 XXX XXXX"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input 
                  type="text" 
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="e.g., Hargeisa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select 
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select country</option>
                  <option value="Somalia">Somalia</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tell us about your center</label>
              <textarea 
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Current student count, facilities, programs offered..."
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Submit Application
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}

export default BecomePartner;

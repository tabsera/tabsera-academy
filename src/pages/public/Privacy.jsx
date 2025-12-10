import React from 'react';
import { Layout } from '../../components/Layout';
import { Shield, Eye, Lock, Database, Share2, UserCheck, Mail, Calendar } from 'lucide-react';

function Privacy() {
  const lastUpdated = 'December 1, 2024';

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          text: 'When you create an account or enroll in courses, we collect information such as your name, email address, phone number, and payment information. For students enrolled through learning centers, we may also collect information provided by your learning center administrator.'
        },
        {
          subtitle: 'Usage Data',
          text: 'We automatically collect information about how you interact with our platform, including pages visited, courses accessed, time spent on lessons, quiz scores, and progress through learning tracks.'
        },
        {
          subtitle: 'Device Information',
          text: 'We collect information about the devices you use to access our platform, including device type, operating system, browser type, and IP address.'
        }
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Providing Services',
          text: 'We use your information to provide, maintain, and improve our educational services, process enrollments and payments, and deliver course content.'
        },
        {
          subtitle: 'Communication',
          text: 'We may send you service-related communications, course updates, progress reports, and promotional materials (which you can opt out of at any time).'
        },
        {
          subtitle: 'Analytics & Improvement',
          text: 'We analyze usage patterns to improve our courses, develop new features, and enhance the overall learning experience.'
        },
        {
          subtitle: 'Learning Center Reporting',
          text: 'For students enrolled through learning centers, we share progress reports and attendance data with your learning center administrators.'
        }
      ]
    },
    {
      icon: Share2,
      title: 'Information Sharing',
      content: [
        {
          subtitle: 'Learning Center Partners',
          text: 'If you are enrolled through a learning center, we share your enrollment status, progress data, and performance metrics with your learning center administrators.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We work with trusted third-party service providers for payment processing, email delivery, and analytics. These providers are contractually obligated to protect your information.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information when required by law, to protect our rights, or in response to valid legal requests from authorities.'
        }
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        {
          subtitle: 'Security Measures',
          text: 'We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.'
        },
        {
          subtitle: 'Access Controls',
          text: 'Access to personal data is restricted to authorized personnel who need it to perform their job functions, and all access is logged and monitored.'
        },
        {
          subtitle: 'Data Retention',
          text: 'We retain your personal information for as long as your account is active or as needed to provide services. You can request deletion of your data at any time.'
        }
      ]
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content: [
        {
          subtitle: 'Access & Correction',
          text: 'You have the right to access your personal information and request corrections to any inaccurate data. You can view and update most information through your account settings.'
        },
        {
          subtitle: 'Data Portability',
          text: 'You can request a copy of your personal data in a structured, commonly used format.'
        },
        {
          subtitle: 'Deletion',
          text: 'You can request deletion of your account and associated personal data. Note that some information may be retained for legal or legitimate business purposes.'
        },
        {
          subtitle: 'Opt-Out',
          text: 'You can opt out of promotional communications at any time by clicking the unsubscribe link in emails or updating your notification preferences.'
        }
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-xl text-blue-100">
              Your privacy is important to us. This policy explains how TABSERA Academy
              collects, uses, and protects your personal information.
            </p>
            <div className="flex items-center gap-2 mt-6 text-blue-200">
              <Calendar className="w-5 h-5" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-gray-600">
                  <strong className="text-gray-900">We protect your data</strong> using industry-standard
                  security measures and encryption.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  <strong className="text-gray-900">We're transparent</strong> about what data we collect
                  and how we use it.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-gray-600">
                  <strong className="text-gray-900">You're in control</strong> of your data with rights to
                  access, correct, and delete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <div key={idx} className="scroll-mt-20" id={section.title.toLowerCase().replace(/\s+/g, '-')}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <div className="space-y-6 pl-16">
                  {section.content.map((item, itemIdx) => (
                    <div key={itemIdx}>
                      <h3 className="font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Children's Privacy */}
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our platform is designed for learners of all ages. For users under 13, we require
                parental or guardian consent and enrollment through a learning center. Learning
                centers are responsible for obtaining appropriate consent before enrolling minor
                students. We collect only the minimum information necessary to provide educational
                services and do not engage in targeted advertising to children.
              </p>
            </div>

            {/* International Data */}
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed">
                TABSERA Academy operates across multiple countries in East Africa and beyond.
                Your information may be transferred to and processed in countries other than your
                country of residence. We ensure appropriate safeguards are in place to protect
                your data regardless of where it is processed.
              </p>
            </div>

            {/* Updates */}
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any
                significant changes by posting a notice on our platform or sending you an email.
                We encourage you to review this policy periodically.
              </p>
            </div>

            {/* Contact */}
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">privacy@tabsera.com</span>
                </div>
                <p className="text-gray-600 text-sm">
                  TABSERA Academy<br />
                  Hargeisa, Somalia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Privacy;

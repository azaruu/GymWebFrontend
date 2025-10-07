import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ExternalLink,
  MessageCircle,
  Loader
} from "lucide-react";

function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const formRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setIsMapLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    emailjs
      .sendForm(
        "service_2q73z6m",
        "template_egu4xki",
        formRef.current,
        "auOh1nJwthhCzqCMr"
      )
      .then(() => {
        setIsSubmitted(true);
        setIsSending(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setIsSubmitted(false), 3000);
      })
      .catch((err) => {
        console.error("Email error:", err);
        alert("❌ Failed to send email. Try again later.");
        setIsSending(false);
      });
  };

  const faqItems = [
    {
      question: "What are your gym operating hours?",
      answer: "Our gym is open 24/7 for all members. Staffed hours are from 5:00 AM to 11:00 PM daily."
    },
    {
      question: "Do you offer personal training sessions?",
      answer: "Yes, we have certified personal trainers available for one-on-one sessions. Packages start at $50/session."
    },
    {
      question: "Can I freeze my membership?",
      answer: "Yes, you can freeze your membership for up to 3 months per year for medical reasons or travel."
    },
    {
      question: "What amenities do you offer?",
      answer: "We offer locker rooms, showers, towel service, fitness classes, swimming pool, and a smoothie bar."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1770&q=80')",
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h1>
            <p className="text-xl text-gray-300">
              We're here to help you with any questions about our gym, membership, or fitness programs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Phone className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">Speak directly with our team</p>
              <a
                href="tel:7012734448"
                className="text-blue-600 font-semibold text-lg hover:text-blue-800 transition-colors"
              >
                7012734448
              </a>
              <p className="text-sm text-gray-500 mt-1">Muhammed Azarudheen</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Mail className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">Send us an email anytime</p>
              <a
                href="mailto:azarudheen@fitnesscenter.com"
                className="text-green-600 font-semibold text-lg hover:text-green-800 transition-colors"
              >
                azarudheen@fitnesscenter.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <MapPin className="text-orange-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-2">Come see our facilities</p>
              <p className="text-gray-800 font-medium">Falcon Fitness Center</p>
              <p className="text-gray-600 text-sm">Doha, Qatar</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-center"
                >
                  <CheckCircle className="mr-2" size={20} />
                  Thank you for your message! We'll get back to you soon.
                </motion.div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSending ? (
                    <>
                      <Loader className="animate-spin mr-2" size={20} />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="ml-2" size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Map */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="h-64 relative">
                  {isMapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <iframe
                    title="Google Maps - Falcon Fitness Center"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.512260555555!2d51.5510217!3d25.2501461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45cfebed035cb1%3A0x1be9d9b7cf74c28d!2sFalcon%20Fitness%20Center!5e0!3m2!1sen!2sqa!4v1694567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: isMapLoading ? 'blur(5px)' : 'none' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => setIsMapLoading(false)}
                  ></iframe>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <MapPin className="mr-2 text-red-500" size={24} />
                    Our Location
                  </h3>
                  <p className="text-gray-600 mb-3">Falcon Fitness Center, Doha, Qatar</p>
                  <a
                    href="https://goo.gl/maps/example"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors"
                  >
                    Open in Google Maps <ExternalLink className="ml-1" size={14} />
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="mr-2 text-orange-500" size={24} />
                  Business Hours
                </h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">5:00 AM - 11:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">6:00 AM - 10:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">7:00 AM - 9:00 PM</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-600">24/7 Access</span>
                    <span className="font-medium text-green-600">Available for Members</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find quick answers to common questions about our gym and services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <HelpCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold mb-2">{item.question}</h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Fitness Journey?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Contact us today to schedule a tour or sign up for a membership</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:7012734448" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center">
              <Phone className="mr-2" size={20} /> Call Now
            </a>
            <a
              href="https://wa.me/7012734448"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2" size={20} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Falcon Fitness Center</h3>
              <p className="text-gray-400">Transforming lives through fitness</p>
              <p className="text-gray-400 text-sm mt-1">Managed by: Muhammed Azarudheen</p>
            </div>

            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Falcon Fitness Center. All rights reserved.</p>
            <p className="mt-1">Contact: 7012734448 | Muhammed Azarudheen</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Contact;
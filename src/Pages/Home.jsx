import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "./Navbar";
import { Dumbbell, Users, UserCheck, DollarSign, ArrowRight, Play, Star, Award, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import {jwtDecode} from "jwt-decode";

function Home() {
 const navigate = useNavigate();
  const audioRef = useRef(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Check user role on component mount
    const token = Cookies.get("auth");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = 
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded.role;
        
        setRole(userRole?.toLowerCase());
      } catch (err) {
        console.error("JWT Decode Error:", err);
      }
    }
  }, []);

  const handlePlay = () => {
    if (audioRef.current) audioRef.current.play();
  };

  const handleMemberManageClick = () => {
    const token = Cookies.get("auth");

    if (!token) {
      alert("No token found. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userRole = 
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded.role;
      
      const roleNormalized = userRole?.toLowerCase();
      setRole(roleNormalized);
      
      if (roleNormalized === "admin" || roleNormalized === "trainer") {
        navigate("/membermanage");
      } else {
        alert("You do not have access to this feature!");
      }
    } catch (err) {
      console.error("JWT Decode Error:", err);
      alert("Invalid token!");
      navigate("/login");
    }
  };
       
  const handleAttendence = () => {
    navigate("/attendence");
  };


                  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
  
      
            {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80')",
          }}
        ></div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-orange-500 opacity-10"
              style={{
                width: Math.random() * 200 + 100,
                height: Math.random() * 200 + 100,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Transform Your <span className="text-orange-500">Body</span>, <br />
            Transform Your <span className="text-orange-500">Life</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of members achieving their fitness goals with our state-of-the-art facilities and expert trainers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate("/register")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1"
            >
              Start Your Journey <ArrowRight className="ml-2" size={20} />
            </button>

            <button
              onClick={handlePlay}
              className="bg-transparent hover:bg-white/10 text-white py-4 px-8 rounded-full border border-white flex items-center justify-center transition-all duration-300 group"
            >
              <Play className="mr-2 group-hover:text-orange-500 transition-colors" size={20} /> Watch Tour
            </button>
         {(role === "admin" || role === "trainer") && (
            <button
              onClick={handleMemberManageClick}
              className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
            >
              Member Manage
            </button>
           )}
         {(role === "admin" || role === "trainer"||role === "member" ) && (
          <button
            onClick={handleAttendence}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1"
          >
            Attendance
          </button>
       
      )}
      
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <audio
          ref={audioRef}
          src="https://freetouse.com/music/aylex/off-road"
        />
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div 
              className="text-center p-6 rounded-lg bg-gray-50 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <Users className="mx-auto text-orange-500" size={40} />
              <h3 className="text-3xl font-bold mt-4">5,000+</h3>
              <p className="text-gray-600">Active Members</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-lg bg-gray-50 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <Award className="mx-auto text-orange-500" size={40} />
              <h3 className="text-3xl font-bold mt-4">15+</h3>
              <p className="text-gray-600">Years Experience</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-lg bg-gray-50 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <Dumbbell className="mx-auto text-orange-500" size={40} />
              <h3 className="text-3xl font-bold mt-4">200+</h3>
              <p className="text-gray-600">Modern Equipment</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-lg bg-gray-50 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <UserCheck className="mx-auto text-orange-500" size={40} />
              <h3 className="text-3xl font-bold mt-4">50+</h3>
              <p className="text-gray-600">Expert Trainers</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Why Choose Our Gym?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              We offer everything you need to achieve your fitness goals in a supportive community.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Clock size={30} />, title: "24/7 Access", desc: "Work out on your schedule with our round-the-clock access" },
              { icon: <Heart size={30} />, title: "Health First", desc: "Programs designed with your health and safety as priority" },
              { icon: <DollarSign size={30} />, title: "Best Value", desc: "Premium facilities at competitive pricing with no hidden fees" },
              { icon: <Users size={30} />, title: "Community", desc: "Join a supportive community of fitness enthusiasts" },
              { icon: <Star size={30} />, title: "Premium Equipment", desc: "State-of-the-art equipment maintained to highest standards" },
              { icon: <UserCheck size={30} />, title: "Expert Trainers", desc: "Certified professionals to guide your fitness journey" }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-orange-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to Start Your Fitness Journey?
          </motion.h2>
          <motion.p 
            className="text-xl mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join today and get a free personal training session and fitness assessment.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => navigate("/register")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-10 rounded-full inline-flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1"
          >
            Join Now <ArrowRight className="ml-2" size={20} />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Fitness Center. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Designed with ❤️ for fitness enthusiasts</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
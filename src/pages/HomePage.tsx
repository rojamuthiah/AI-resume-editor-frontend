import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        >
          Build Better Resumes <br />
          <span className="text-blue-600">with AI</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 max-w-2xl text-lg text-gray-600"
        >
          Chat with AI to analyze, improve, and preview your resume in real time.
          Every change is transparent. You stay in control.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 flex gap-4"
        >
          <a
            href="/templates/categories"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </a>
          <a
            href="/templates/categories"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            View Templates
          </a>
        </motion.div>
      </section>

      {/* ================= SECTION 2 — TIMELINE ================= */}
      <section className="py-24 bg-gray-50 px-6">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-16"
        >
          Why This Is Different
        </motion.h2>

        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300" />

          {[
            {
              title: "Chat-Driven Editing",
              desc: "Ask questions and request improvements using natural language.",
            },
            {
              title: "Live Resume Preview",
              desc: "See exactly how each suggestion affects your resume before applying it.",
            },
            {
              title: "ATS-Focused Improvements",
              desc: "Identify and add role-specific keywords aligned with ATS systems.",
            },
            {
              title: "Accept or Revert Safely",
              desc: "Preview changes first. Accept or revert anytime — no blind edits.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative pl-12 pb-12"
            >
              {/* Dot */}
              <div className="absolute left-[9px] top-1 w-3 h-3 rounded-full bg-blue-600" />

              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 3 — HOW IT WORKS ================= */}
      <section className="py-24 px-6">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-12"
        >
          How It Works
        </motion.h2>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            "Choose a Template",
            "Chat with AI",
            "Preview Changes",
            "Accept or Revert",
          ].map((step, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="p-6 rounded-xl border bg-white shadow-sm"
            >
              <div className="text-blue-600 text-2xl font-bold mb-3">
                {i + 1}
              </div>
              <p className="font-medium">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 6 — CTA ================= */}
      <section className="py-24 bg-blue-600 text-white text-center px-6">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold"
        >
          Ready to Improve Your Resume?
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 text-blue-100"
        >
          Make smarter edits, preview changes instantly, and stay in control.
        </motion.p>

        <motion.a
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.4, duration: 0.6 }}
          href="/templates/categories"
          className="inline-block mt-8 px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Start Editing Your Resume
        </motion.a>
      </section>

      {/* ================= ABOUT ================= */}
      <footer className="py-20 px-6 bg-gray-50 text-center">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-2xl font-semibold"
        >
          Contact
        </motion.h3>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 max-w-xl mx-auto text-gray-600"
        >
          <p className="mt-4 max-w-xl mx-auto text-gray-600">
  You can connect with me{" "}
  <span className="font-mono text-blue-600">
    &lt;RojaMuthiah&gt;
  </span>{" "}
  via
</p>

        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 flex justify-center gap-6"
        >
          <a
            href="https://github.com/rojamuthiah"
            target="_blank"
            rel="noreferrer"
            className="text-gray-700 hover:text-black transition"
          >
            <Github />
          </a>
          <a
            href="https://www.linkedin.com/in/rojamuthiah/"
            target="_blank"
            rel="noreferrer"
            className="text-gray-700 hover:text-blue-700 transition"
          >
            <Linkedin />
          </a>
          <a
            href="mailto:romu0304@gmail.com"
            className="text-gray-700 hover:text-red-600 transition"
          >
            <Mail />
          </a>
        </motion.div>
      </footer>
    </div>
  );
};

export default HomePage;

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Connect with the Team</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#163D32]">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-lg mx-auto">
            Have questions about contributing cultural archives, partnership opportunities, or institutional research? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E7E5DF] space-y-2">
              <Mail className="w-5 h-5 text-[#B85C38]" />
              <h3 className="font-editorial text-lg font-bold text-[#163D32]">Email</h3>
              <p className="text-xs text-stone-600">contact@cultureverse.org</p>
              <p className="text-xs text-stone-600">curators@cultureverse.org</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E7E5DF] space-y-2">
              <MapPin className="w-5 h-5 text-[#B85C38]" />
              <h3 className="font-editorial text-lg font-bold text-[#163D32]">Heritage Hubs</h3>
              <p className="text-xs text-stone-600">Lagos • Ibadan • Enugu • Kano</p>
              <p className="text-xs text-stone-500">Nigeria, West Africa</p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl border border-[#E7E5DF] p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-editorial text-2xl font-bold text-[#163D32]">
                  Message Received!
                </h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  Thank you for reaching out. Our community preservation team will respond to your inquiry shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Babatunde / Chinyere / Sani"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Message / Inquiry
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we collaborate on African cultural learning?"
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

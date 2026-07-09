import { useState, useEffect } from "react";
import { Search, Share2, Calendar, User, Clock, Heart, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Blog } from "../types";

export default function MedicalBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showToast, setShowToast] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (data.blogs) setBlogs(data.blogs);
      });
  }, []);

  const categories = ["All", "Heart Care", "Yoga", "Mental Health", "Nutrition", "Diabetes"];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleShare = (title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/blog#${title.toLowerCase().replace(/ /g, "-")}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search health articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 text-sm border border-green-100 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#2E7D32] focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 duration-100 ${
                selectedCategory === cat
                  ? "bg-[#2E7D32] text-white shadow-md shadow-green-100/30 dark:shadow-none"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-green-50/50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Grid */}
      {selectedBlog ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl shadow-xl border border-green-100/20 max-w-4xl mx-auto space-y-6"
        >
          <button
            onClick={() => setSelectedBlog(null)}
            className="text-[#2E7D32] text-xs font-bold hover:underline mb-4 inline-flex items-center gap-1.5 cursor-pointer"
          >
            ← Back to health articles
          </button>
          <img
            src={selectedBlog.image}
            alt={selectedBlog.title}
            className="w-full h-[320px] object-cover rounded-2xl shadow-md"
          />
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="bg-emerald-50 dark:bg-green-950/40 text-[#2E7D32] px-3 py-1 rounded-full font-bold">
              {selectedBlog.category}
            </span>
            <span className="flex items-center gap-1"><User size={13} /> {selectedBlog.author}</span>
            <span className="flex items-center gap-1"><Calendar size={13} /> {selectedBlog.date}</span>
            <span className="flex items-center gap-1"><Clock size={13} /> {selectedBlog.readTime}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-slate-900 dark:text-white leading-tight">
            {selectedBlog.title}
          </h2>

          <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap space-y-4">
            <p className="font-medium text-slate-800 dark:text-slate-100 text-base">
              At Nirogi-TanMan, we integrate modern scientific clinical findings with ancient ayurvedic methodologies to create optimal lifestyle pathways. Here is what you need to know.
            </p>
            {selectedBlog.content}
            <p className="border-t border-slate-100 dark:border-slate-700 pt-6 text-xs text-slate-400">
              Disclaimer: The information above is published for wellness education purposes. Always consult Dr. Aditya Sharma or Dr. Priya Patel before self-prescribing alternative medical routes.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              layout
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-50/10 border border-green-50/20 flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
                <span className="absolute top-4 left-4 bg-[#2E7D32] text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {blog.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {blog.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {blog.readTime}</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-slate-800 dark:text-white hover:text-[#2E7D32] transition line-clamp-2 leading-snug">
                    {blog.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed">
                    {blog.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setSelectedBlog(blog)}
                    className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] inline-flex items-center gap-1 transition cursor-pointer"
                  >
                    Read Article <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => handleShare(blog.title)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 rounded-xl transition cursor-pointer"
                    title="Copy Share Link"
                  >
                    <Share2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sharing notification toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-full shadow-2xl flex items-center gap-2">
          <Heart size={14} className="fill-red-500 text-red-500 animate-pulse" />
          <span>Article link copied! Feel free to share on WhatsApp or Twitter.</span>
        </div>
      )}
    </div>
  );
}

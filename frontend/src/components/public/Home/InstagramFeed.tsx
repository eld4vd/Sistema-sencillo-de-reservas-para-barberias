import { motion } from "framer-motion";
import { FaInstagram, FaHeart, FaComment } from "react-icons/fa";

interface InstagramPost {
  id: number;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  username: string;
  timestamp: string;
}

// Simulación de posts de Instagram (en producción usarías la API real)
const mockPosts: InstagramPost[] = [
  {
    id: 1,
    image: "/src/assets/images/cortes/mid-fade.jpg",
    caption: "Increíble trabajo! 🔥 #BarberSunsetz #Sucre",
    likes: 234,
    comments: 18,
    username: "@juanperez",
    timestamp: "Hace 2 días"
  },
  {
    id: 2,
    image: "/src/assets/images/cortes/pompadour-moderno.jpg",
    caption: "Best barber in town! 💈✨",
    likes: 189,
    comments: 12,
    username: "@diego_m",
    timestamp: "Hace 3 días"
  },
  {
    id: 3,
    image: "/src/assets/images/cortes/quiff-texturizado.jpg",
    caption: "Siempre salgo renovado 🙌",
    likes: 156,
    comments: 9,
    username: "@luis.r",
    timestamp: "Hace 5 días"
  },
  {
    id: 4,
    image: "/src/assets/images/cortes/french-crop.jpg",
    caption: "La mejor experiencia de barbería #SunSetz",
    likes: 201,
    comments: 15,
    username: "@marco_av",
    timestamp: "Hace 1 semana"
  },
  {
    id: 5,
    image: "/src/assets/images/cortes/undercut.jpg",
    caption: "Clean cut by @barberiasunsetzsucre 💯",
    likes: 178,
    comments: 11,
    username: "@andres.v",
    timestamp: "Hace 1 semana"
  },
  {
    id: 6,
    image: "/src/assets/images/cortes/flow.jpg",
    caption: "Transformed! Thanks guys 🔥",
    likes: 143,
    comments: 8,
    username: "@carlos_j",
    timestamp: "Hace 2 semanas"
  }
];

const InstagramFeed = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#050607] to-[#0A0A0A] py-24 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(184,147,94,0.06),_transparent_60%)]" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8935E]/40 bg-[#B8935E]/10 px-5 py-2 text-sm font-medium text-[#B8935E]">
            <FaInstagram className="text-lg" />
            Síguenos en Instagram
          </div>
          <h2 className="text-5xl font-bold md:text-6xl">
            Lo que dicen{" "}
            <span className="bg-gradient-to-r from-[#B8935E] to-[#C9A46F] bg-clip-text text-transparent">
              nuestros clientes
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Etiquétanos en tus fotos con <span className="font-bold text-[#B8935E]">@barberiasunsetzsucre</span> para aparecer aquí
          </p>
        </motion.div>

        {/* Grid de Posts */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {mockPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] cursor-pointer"
            >
              {/* Imagen */}
              <img
                src={post.image}
                alt={post.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay en hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  {/* Top: Username */}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#B8935E] to-[#8B6F47] flex items-center justify-center text-xs font-bold">
                      {post.username[1].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{post.username}</p>
                      <p className="text-xs text-white/60">{post.timestamp}</p>
                    </div>
                  </div>

                  {/* Bottom: Engagement */}
                  <div className="space-y-2">
                    <p className="text-sm line-clamp-2">{post.caption}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <FaHeart className="text-red-500" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaComment />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instagram Icon */}
              <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                <FaInstagram className="text-2xl text-white drop-shadow-lg" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="https://instagram.com/barberiasunsetzsucre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#B8935E] to-[#C9A46F] px-8 py-4 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-[0_20px_50px_rgba(184,147,94,0.4)]"
          >
            <FaInstagram className="text-2xl" />
            Síguenos en Instagram
          </a>
          <p className="mt-4 text-sm text-white/50">
            +5K seguidores · Posts diarios
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default InstagramFeed;

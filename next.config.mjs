const nextConfig = {
 reactStrictMode: true,
 poweredByHeader: false,
 async headers(){
  return [{source:'/admin',headers:[{key:'Cross-Origin-Opener-Policy',value:'same-origin-allow-popups'}]}];
 }
};
export default nextConfig;

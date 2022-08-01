// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const file = ".././public/assets/img/bg-cta.jpg"
  res.status(200).json({
    link: "https://drive.google.com/file/d/1-NweFI6v0Enm4YbYr0jPc4uainw_uD-D/view?usp=sharing"
  });
}

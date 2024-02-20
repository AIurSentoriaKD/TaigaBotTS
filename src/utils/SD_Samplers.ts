export const sd_samplers = [
  {
    name: "DPM++ 2M Karras",
    aliases: ["k_dpmpp_2m_ka"],
    options: {
      scheduler: "karras",
    },
  },
  {
    name: "DPM++ SDE Karras",
    aliases: ["k_dpmpp_sde_ka"],
    options: {
      scheduler: "karras",
      second_order: "True",
      brownian_noise: "True",
    },
  },
  {
    name: "Euler a",
    aliases: ["k_euler_a", "k_euler_ancestral"],
    options: {
      uses_ensd: "True",
    },
  },
  {
    name: "Euler",
    aliases: ["k_euler"],
    options: {},
  },
  {
    name: "DDIM",
    aliases: ["ddim"],
    options: {},
  },
];
export const sd_upscalers = [
  {
    name: "None",
    model_name: null,
    model_path: null,
    model_url: null,
    scale: 4,
  },
  {
    name: "Lanczos",
    model_name: null,
    model_path: null,
    model_url: null,
    scale: 4,
  },
  {
    name: "Nearest",
    model_name: null,
    model_path: null,
    model_url: null,
    scale: 4,
  },
  {
    name: "4x_NMKD-Superscale-SP_178000_G",
    model_name: "ESRGAN_4x",
    model_path:
      "F:\\stable-diffusion-webui\\models\\ESRGAN\\4x_NMKD-Superscale-SP_178000_G.pth",
    model_url: null,
    scale: 4,
  },
  {
    name: "4xUltrasharp_4xUltrasharpV10",
    model_name: "ESRGAN_4x",
    model_path:
      "F:\\stable-diffusion-webui\\models\\ESRGAN\\4xUltrasharp_4xUltrasharpV10.pth",
    model_url: null,
    scale: 4,
  },
  {
    name: "LDSR",
    model_name: null,
    model_path: null,
    model_url: null,
    scale: 4,
  },
  {
    name: "R-ESRGAN 4x+",
    model_name: null,
    model_path:
      "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
    model_url: null,
    scale: 4,
  },
  {
    name: "R-ESRGAN 4x+ Anime6B",
    model_name: null,
    model_path:
      "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
    model_url: null,
    scale: 4,
  },
  {
    name: "ScuNET GAN",
    model_name: "ScuNET GAN",
    model_path:
      "https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_gan.pth",
    model_url: null,
    scale: 4,
  },
  {
    name: "ScuNET PSNR",
    model_name: "ScuNET GAN",
    model_path:
      "https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_psnr.pth",
    model_url: null,
    scale: 4,
  },
  {
    name: "SwinIR 4x",
    model_name: "SwinIR 4x",
    model_path:
      "https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/003_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR-L_x4_GAN.pth",
    model_url: null,
    scale: 4,
  },
];

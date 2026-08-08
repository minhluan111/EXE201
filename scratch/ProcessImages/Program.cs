using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

namespace ProcessImages
{
    class Program
    {
        static void SaveOptimized(Image img, string destPath, int maxDimension = 1200, long quality = 85L)
        {
            int w = img.Width;
            int h = img.Height;

            // Handle EXIF orientation
            foreach (var prop in img.PropertyItems)
            {
                if (prop.Id == 0x0112)
                {
                    int orientation = BitConverter.ToUInt16(prop.Value, 0);
                    if (orientation == 6)
                        img.RotateFlip(RotateFlipType.Rotate90FlipNone);
                    else if (orientation == 8)
                        img.RotateFlip(RotateFlipType.Rotate270FlipNone);
                    else if (orientation == 3)
                        img.RotateFlip(RotateFlipType.Rotate180FlipNone);
                    break;
                }
            }

            w = img.Width;
            h = img.Height;

            if (w > maxDimension || h > maxDimension)
            {
                if (w > h)
                {
                    h = (int)((double)h * maxDimension / w);
                    w = maxDimension;
                }
                else
                {
                    w = (int)((double)w * maxDimension / h);
                    h = maxDimension;
                }
            }

            using (var resized = new Bitmap(w, h, PixelFormat.Format24bppRgb))
            {
                using (var g = Graphics.FromImage(resized))
                {
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.DrawImage(img, new Rectangle(0, 0, w, h));
                }

                var encoder = GetEncoder(ImageFormat.Jpeg);
                var encParams = new EncoderParameters(1);
                encParams.Param[0] = new EncoderParameter(Encoder.Quality, quality);

                Directory.CreateDirectory(Path.GetDirectoryName(destPath)!);
                resized.Save(destPath, encoder, encParams);
                Console.WriteLine($"Saved: {destPath} ({w}x{h}, {new FileInfo(destPath).Length / 1024} KB)");
            }
        }

        static ImageCodecInfo GetEncoder(ImageFormat format)
        {
            foreach (var c in ImageCodecInfo.GetImageDecoders())
            {
                if (c.FormatID == format.Guid) return c;
            }
            return null!;
        }

        static void Main()
        {
            string srcDir = @"E:\IELTS\EXE201\MONARI";
            string feDir = @"E:\IELTS\EXE201\FE\public\assets\monari";

            // Process JPG/PNG files directly
            var files = Directory.GetFiles(srcDir);
            foreach (var f in files)
            {
                string name = Path.GetFileName(f);
                try
                {
                    using (var img = Image.FromFile(f))
                    {
                        if (name.Contains("Bàn 4 người.png"))
                            SaveOptimized(img, Path.Combine(feDir, "tables", "ban_4_nguoi.jpg"));
                        else if (name.Contains("Bàn 8 người.png"))
                            SaveOptimized(img, Path.Combine(feDir, "tables", "ban_8_nguoi.jpg"));
                        else if (name.Contains("Để trong không gian quán.png"))
                            SaveOptimized(img, Path.Combine(feDir, "decor", "space_decor.jpg"));
                        else if (name == "IMG_4195.JPG")
                            SaveOptimized(img, Path.Combine(feDir, "decor", "space_view_1.jpg"));
                        else if (name == "IMG_4196.JPG")
                            SaveOptimized(img, Path.Combine(feDir, "decor", "space_view_2.jpg"));
                        else if (name == "IMG_4197.JPG")
                            SaveOptimized(img, Path.Combine(feDir, "decor", "space_view_3.jpg"));
                        else if (name == "IMG_4198.JPG")
                            SaveOptimized(img, Path.Combine(feDir, "decor", "space_view_4.jpg"));
                    }
                }
                catch
                {
                    // HEIC handled via node
                }
            }
        }
    }
}

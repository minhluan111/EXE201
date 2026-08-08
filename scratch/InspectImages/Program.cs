using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

namespace Inspect
{
    class Program
    {
        static void Main()
        {
            string dir = @"E:\IELTS\EXE201\MONARI";
            foreach (var f in Directory.GetFiles(dir))
            {
                string name = Path.GetFileName(f);
                try
                {
                    using (var img = Image.FromFile(f))
                    {
                        int orientation = 1;
                        foreach (var prop in img.PropertyItems)
                        {
                            if (prop.Id == 0x0112) // Orientation tag
                            {
                                orientation = BitConverter.ToUInt16(prop.Value, 0);
                            }
                        }
                        Console.WriteLine($"[JPG/PNG] {name} | Size: {img.Width}x{img.Height} | Orientation: {orientation}");
                    }
                }
                catch
                {
                    Console.WriteLine($"[HEIC/RAW] {name}");
                }
            }
        }
    }
}

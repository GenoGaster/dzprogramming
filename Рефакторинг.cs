// Вставьте сюда финальное содержимое файла DrawingProgram.cs
using System;
using Avalonia.Media;
using RefactorMe.Common;

namespace RefactorMe
{
    class Painter
    {
        static float x, y;
        static IGraphics graphics = null!;

        public static void Initialize(IGraphics newGraphics)
        {
            graphics = newGraphics;
            //grafika.SmoothingMode = SmoothingMode.None;
            graphics.Clear(Colors.Black);
        }

        public static void SetPosition(float x0, float y0)
        {
            x = x0;
            y = y0;
        }

        public static void DrawStep(Pen pen, double length, double angle)
        {
            // Делает шаг длиной length в направлении angle и рисует пройденную траекторию
            var x1 = (float)(x + length * Math.Cos(angle));
            var y1 = (float)(y + length * Math.Sin(angle));
            graphics.DrawLine(pen, x, y, x1, y1);
            x = x1;
            y = y1;
        }

        public static void Move(double length, double angle)
        {
            x = (float)(x + length * Math.Cos(angle));
            y = (float)(y + length * Math.Sin(angle));
        }
    }

    public class ImpossibleSquare
    {
        private const double SideLengthProportion = 0.375;
        private const double CornerSizeProportion = 0.04;

        public static void Draw(int width, int height, double rotationAngle, IGraphics graphics)
        {
            Painter.Initialize(graphics);

            var size = Math.Min(width, height);

            var diagonalLength = Math.Sqrt(2) * (size * SideLengthProportion + size * CornerSizeProportion) / 2;
            var startX = (float)(diagonalLength * Math.Cos(Math.PI / 4 + Math.PI)) + width / 2f;
            var startY = (float)(diagonalLength * Math.Sin(Math.PI / 4 + Math.PI)) + height / 2f;

            Painter.SetPosition(startX, startY);

            // Рисуем 1-ую сторону
            DrawSide(0, size);

            // Рисуем 2-ую сторону
            DrawSide(-Math.PI / 2, size);

            // Рисуем 3-ю сторону
            DrawSide(Math.PI, size);

            // Рисуем 4-ую сторону
            DrawSide(Math.PI / 2, size);
        }

        private static void DrawSide(double baseAngle, double size)
        {
            var pen = new Pen(Brushes.Yellow);
            var sideLength = size * SideLengthProportion;
            var cornerLength = size * CornerSizeProportion * Math.Sqrt(2);

            Painter.DrawStep(pen, sideLength, baseAngle);
            Painter.DrawStep(pen, cornerLength, baseAngle + Math.PI / 4);
            Painter.DrawStep(pen, sideLength, baseAngle + Math.PI);
            Painter.DrawStep(pen, sideLength - size * CornerSizeProportion, baseAngle + Math.PI / 2);

            Painter.Move(size * CornerSizeProportion, baseAngle - Math.PI);
            Painter.Move(cornerLength, baseAngle + 3 * Math.PI / 4);
        }
    }
}

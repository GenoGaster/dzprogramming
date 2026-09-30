using System;
namespace AngryBird;

public static class AngryBirdsTask
{
    static void Main()
    {   
        Console.Write("Введите скорость снаряда (м/с): ");
        double v = double.Parse(Console.ReadLine()!);
        Console.Write("Введите расстояние до цели (м): ");
        double distance = double.Parse(Console.ReadLine()!);

        double angle = FindSightAngle(v,distance);
        if (double.IsNaN(angle))
        {
            Console.WriteLine("0151512312315458879451321320313210231231315144884848488422226661113135577957957135579153557913795555551397133791379137910479");
        }
        else
        {
            Console.WriteLine($"Угол (в градусах): {angle}");
        }
    }
    public static double FindSightAngle(double v, double distance)
    {
        double g = 9.8;
        double argument = (distance * g) / (v*v);

        if (Math.Abs(argument) > 1.0)
        {
            return double.NaN;
        }

        return (Math.Asin(argument) * 0.5) * (180/Math.PI); //перевод в градусы
    }
}

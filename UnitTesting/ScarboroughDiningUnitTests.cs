using System;
using System.Threading;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace ConsoleApp4
{
    [TestFixture]
    public class ScarboroughDiningUnitTests
    {
        IWebDriver driver = new ChromeDriver();

        [SetUp]
        public void initialize()
        {
            driver.Navigate().GoToUrl("http://gentle-sea-06157.herokuapp.com/"); Thread.Sleep(2000);
            //driver.Manage().Window.Maximize();
        }


        [Test]
        public void RestaurantSignUp()
        {
            var jsDriver = (IJavaScriptExecutor)driver;
            string highlightJavascript = @"arguments[0].style.cssText = ""border-width: 2px; border-style: solid; border-color: red"";";

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.CssSelector("[href='/restaurantSignup/']")) }); Thread.Sleep(1000);
            driver.FindElement(By.CssSelector("[href='/restaurantSignup/']")).Click(); Thread.Sleep(5000);
            //driver.Navigate().GoToUrl("http://gentle-sea-06157.herokuapp.com/restaurantSignup/");

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("name")) });
            //RESTAURANT NAME
            driver.FindElement(By.Name("name")).SendKeys("Bubbletea"); Thread.Sleep(1000);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("phoneNumber")) });
            driver.FindElement(By.Name("phoneNumber")).SendKeys("416-555-1234"); Thread.Sleep(300);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("address")) });
            driver.FindElement(By.Name("address")).SendKeys("132 Mondeo Drive Scarborough Ontario"); Thread.Sleep(300);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("tags")) });
            driver.FindElement(By.Name("tags")).SendKeys("Bubbletea"); Thread.Sleep(300);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("ownerFirstName")) });
            driver.FindElement(By.Name("ownerFirstName")).SendKeys("Jesse"); Thread.Sleep(300);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("ownerLastName")) });
            driver.FindElement(By.Name("ownerLastName")).SendKeys("F"); Thread.Sleep(300);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("ownerTitle")) });
            driver.FindElement(By.Name("ownerTitle")).SendKeys("Owner"); Thread.Sleep(1000);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("ownerEmail")) });
            driver.FindElement(By.Name("ownerEmail")).SendKeys("jesse.f@freshfruitbubbletea.ca"); Thread.Sleep(300);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("ownerPhoneNumber")) });
            driver.FindElement(By.Name("ownerPhoneNumber")).SendKeys("416-555-1234"); Thread.Sleep(300);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("password")) });
            driver.FindElement(By.Name("password")).SendKeys("12345"); Thread.Sleep(3000);

            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("submit")) }); Thread.Sleep(1000);
            driver.FindElement(By.Name("submit")).Click(); Thread.Sleep(5000);
        }

        [Test]
        public void AddRestaurantStory()
        {
            var jsDriver = (IJavaScriptExecutor)driver;
            string highlightJavascript = @"arguments[0].style.cssText = ""border-width: 2px; border-style: solid; border-color: red"";";



            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("searchContent")) }); Thread.Sleep(1000);
            //RESTAURANT NAME
            driver.FindElement(By.Name("searchContent")).SendKeys("Freshfruit Bubbletea"); Thread.Sleep(1000);
            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.CssSelector("[type='submit']")) }); Thread.Sleep(500);
            driver.FindElement(By.CssSelector("[type='submit']")).Click(); Thread.Sleep(1000);
            //RESTAURANT NAMEx2
            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.CssSelector("[href='/restaurantProfile/Freshfruit-Bubbletea']")) }); Thread.Sleep(2000);
            driver.FindElement(By.CssSelector("[href='/restaurantProfile/Freshfruit-Bubbletea']")).Click(); Thread.Sleep(1000);
            //RESTAURANT NAMEx2
            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.CssSelector("[href='/storyUploader/Freshfruit-Bubbletea']")) }); Thread.Sleep(1000);
            driver.FindElement(By.CssSelector("[href='/storyUploader/Freshfruit-Bubbletea']")).Click(); Thread.Sleep(1000);
            jsDriver.ExecuteScript(highlightJavascript, new object[] { driver.FindElement(By.Name("storyText")) }); Thread.Sleep(500);
            //RESTAURANT NAME
            driver.FindElement(By.Name("storyText")).SendKeys("Freshfruit Bubbletea, founded in the 1990's, serves fresh and traditional bubble tea with tapioca in many flavours."); Thread.Sleep(2000);
            driver.FindElement(By.Name("submit")).Click(); Thread.Sleep(5000);
        }

        [Test]
        public void CustomerSignUp()
        {
            //driver.FindElement(By.CssSelector("[href='/customerSignup/']")).Click(); Thread.Sleep(5000);
            driver.Navigate().GoToUrl("http://gentle-sea-06157.herokuapp.com/customerSignup/");

            driver.FindElement(By.Name("customerFirstName")).SendKeys("Jesse"); Thread.Sleep(1000);
            driver.FindElement(By.Name("customerLastName")).SendKeys("F"); Thread.Sleep(300);

            driver.FindElement(By.Name("customerBio")).SendKeys("I like to order food on the go. I love burgers!"); Thread.Sleep(1000);
            driver.FindElement(By.Name("customerAddress")).SendKeys("132 Mondeo Drive Scarborough Ontario"); Thread.Sleep(300);

            driver.FindElement(By.Name("customerEmail")).SendKeys("jesse.f@gmail.com"); Thread.Sleep(1000);
            driver.FindElement(By.Name("customerPhoneNumber")).SendKeys("415-555-2345"); Thread.Sleep(1000);
            driver.FindElement(By.Name("password")).SendKeys("12345"); Thread.Sleep(3000);
            driver.FindElement(By.Name("submit")).Click(); Thread.Sleep(5000);


        }

        [Test]
        public void RestaurantOrderNow()
        {
            driver.FindElement(By.Name("searchContent")).SendKeys("Freshfruit Bubbletea"); Thread.Sleep(1000);
            driver.FindElement(By.CssSelector("[type='submit']")).Click(); Thread.Sleep(1000);
            //
        }

        [Test]
        public void RestaurantSearch()
        {
            driver.FindElement(By.Name("searchContent")).SendKeys("Freshfruit Bubbletea"); Thread.Sleep(1000);
            driver.FindElement(By.CssSelector("[type='submit']")).Click(); Thread.Sleep(1000);
        }


        [Test]
        public void ExplorePage()
        {
            driver.FindElement(By.CssSelector("[href='/explore/']")).Click(); Thread.Sleep(5000);
        }


        [TearDown]
        public void ClosePage()
        {
            driver.Close();
        }

    }
}

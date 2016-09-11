# concrete5 marketplace packager

This is a series of gulp tasks *badly hashed together* to prepare a package for submission to the concrete5 marketplace and the PRB.

It will help the package:

- Meet [PHP FIG](http://www.php-fig.org) & [concrete5 coding standards](http://documentation.concrete5.org/developers/background/coding-style-guidelines)
- Replace all instances of PHPs `require`, `require_once` & `include` with friendly versions from the Laravel Framework.
- Add `defined('C5_EXECUTE') or die('Access Denied.');` statements to PHP files missing them.
- Package the contents in a marketplace formatted zip file.
- Install any composer dependencies and bundle them with the package.
- Optionaly run the [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer).

**Don't forget to read the [marketplace submission guidelines](https://www.concrete5.org/developers/submitting-code/marketplace-submission-rules) and make sure your package satisfys them before submitting it.**

Happy packaging!


## Installation

The packager consists of a series of [gulp](http://gulpjs.com) tasks and therefore requires you have [node.js](http://nodejs.org) and [npm](http://npmjs.com) installed. You can find instructions for installing them [here](https://docs.npmjs.com/getting-started/installing-node).

Once you have them installed you can install the packager like this:

Clone the repository:
    
    git clone https://github.com/c5labs/marketplace-packager
    

Change to the directory created by the clone:

    cd marketplace-packager


Install the dependencies:

    npm install
    
That's it! You can now run the packager.

## Running the packager

To run the packager, change to the directory that you installed the packager in. You will need the source location of the package that you want to process and also the packages handle.

The handle should be the same as that specified in your packages `controller.php` files `$pkgHandle` property. In the examples we'll use a package with the handle 'test_package'.

You can tell the packager to source the package from anywhere on your system, this may be in an active concrete5 installations packages directory or elsewhere.

To run the packager we run the command:
    
    gulp --source /web/concrete5-test-site/packages/test_package --package test_package
    
Gulp will then process the package and create a marketplace ready zip file named `test_package.zip` within the release directory of the packagers install directory.

### Important
After running the processor and creating the zip file **you must** re-test the resulting code. Extract the zip file and install the plugin on a concrete5 test site and verify that the package still installs & runs correctly **before uploading it to the market place**.

## Options

You can enable / disable various functionality with switches:

`--includedots` - Include hidden .files in the package


`--skipcompose` - Don't run a `composer install` during packaging


`--phpfixer /path/to/phpfixer` - Run PHP fixer on the package code


`--skipincludes` - Don't replace `require`, `require_once` & `include` statements


`--skipexecutes` - Don't add missing `defined('C5_EXECUTE') or die('Access Denied.');` statements to files


`--nopackage` - Don't create a marketplace zip file, this will leave the package within the `build` directory

`--nocleanup` - Don't remove the package from the `build` directory after creating the zip

So... to skip running composer we would run:

    
    gulp --source /web/concrete5-test-site/packages/test_package --package test_package --skipcompose

## License
See attached license file.

## Change Log
See releases on GitHub [here](https://github.com/c5labs/marketplace-packager/releases)
@sphinx @no-txn
Feature: Search comments in projects
  In order to discover what has been said about a subject
  As a Teambox user
  I want to search for keywords

  Background: 
    Given I am logged in as voodoo_prince
    And I am in the project called "Gold Digging"

  Scenario: Search all projects
    Given I am in the project called "Space elevator"
    When I go to the projects page
    And I follow "Gold Digging"
    And I fill in the comment box with "I found a hunk of gold today in the mine!"
    And I press "Save"
    And I follow "Space elevator"
    And I fill in the comment box with "Let's finish this space elevator before Tuesday."
    And I press "Save"
    And I go to the projects page
    
    When the search index is rebuilt
    And I fill in the search box with "the mine"
    And I press "Search"
    Then I should see "1 results found"
    And I should see "Gold Digging"
    And I should see "I found a hunk of gold"
    But I should not see "finish this space elevator"

  Scenario: Search for a conversation by title
    Given there is a conversation titled "Where are the cats?" in the project "Gold Digging"
    When the search index is reindexed
    And I search for "cats"
    Then I should see "Where are the cats?"
    And I should see "Gold Digging"

  Scenario: Search for a conversation by body
    Given there is a conversation with body "Oh my god I love cats LOL" in the project "Gold Digging"
    When the search index is reindexed
    And I search for "cats"
    Then I should see "Oh my god I love cats LOL"
    And I should see "Gold Digging"

  Scenario: Search for a task
    Given there is a task titled "Feed the cats" in the project "Gold Digging"
    When the search index is reindexed
    And I search for "cats"
    Then I should see "Feed the cats"
    And I should see "Gold Digging"

  Scenario: Search for a page
    Given the project page "Minerals to watch for" exists in "Gold Digging"
    When the search index is reindexed
    And I search for "minerals"
    Then I should see "Minerals to watch for"
    
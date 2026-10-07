# Generated from Jira DS-4: Delete program with confirmation
# Review before automating.

Feature: DS-4 Delete program with confirmation

  # Happy paths

  Scenario: Confirmed delete removes program from the list
    Given I am logged in as an admin user
    And a program named "Test Program" exists on the Programs page
    When I click the delete control for "Test Program"
    Then I see a confirmation dialog for deletion
    When I confirm deletion
    Then "Test Program" is removed from the program list
    And I do not see a row for "Test Program" after the list refreshes

  Scenario: Cancel on confirmation keeps the program
    Given I am logged in as an admin user
    And a program exists on the Programs page
    When I click the delete control for that program
    And I see the confirmation dialog
    And I click Cancel or dismiss without confirming
    Then the program still exists in the list unchanged

  Scenario: Deleting one program does not remove other programs
    Given I am logged in as an admin user
    And programs "Keep Me 2026" and "Remove Me 2026" exist
    When I delete "Remove Me 2026" and confirm
    Then "Remove Me 2026" is not in the list
    And "Keep Me 2026" is still in the list

  # Negative

  Scenario: Delete without confirming does not call a successful delete
    Given I am logged in as an admin user
    And a program named "Test Program" exists
    When I open the delete confirmation for "Test Program"
    And I dismiss the dialog without confirming
    Then no successful delete request removes "Test Program"
    And "Test Program" remains visible in the list

  Scenario: Failed delete shows a user-visible error and keeps the program
    Given I am logged in as an admin user
    And a program named "Test Program" exists
    When I confirm deletion but the delete API fails
    Then I see an error message explaining that deletion failed
    And "Test Program" remains in the list unless the product defines another behavior

  # Edge cases

  Scenario: Confirmation dialog identifies the program being deleted
    Given I am logged in as an admin user
    And a program named "Test Program" exists
    When I click the delete control for "Test Program"
    Then the confirmation dialog mentions "Test Program" or clearly identifies the target program

  Scenario: Double-clicking delete does not open multiple destructive confirmations
    Given I am logged in as an admin user
    And a program named "Test Program" exists
    When I double-click the delete control quickly
    Then at most one confirmation dialog is active
    And confirming once deletes at most one instance of that program

  Scenario: Delete control remains usable when the program row is selected
    Given I am logged in as an admin user
    And a program named "Test Program" exists
    When I select or focus the row for "Test Program"
    Then the delete control is visible and clickable
    And I can complete the confirm delete flow

  Scenario: Sequential deletes remove only the intended programs
    Given I am logged in as an admin user
    And three distinct programs exist in the list
    When I delete the first program and confirm
    And I delete the second program and confirm
    Then only those two programs are removed
    And the third program remains in the list

# ---
# Ambiguities / gaps (resolve before automation):
# - Confirmation may be a native browser confirm() vs in-app modal — linked bugs disagree; tests must match chosen UX.
# - Delete control label/icon (trash emoji vs image button) is not specified in ACs.
# - ACs do not cover API error messaging; expected behavior on failure needs product confirmation.
# - Programs with curriculum dependencies or "cannot delete" rules are not mentioned.
# - Whether soft-delete vs hard-delete affects list visibility is not defined.
# - Large lists may not render off-screen rows — confirm delete target is in view before interaction.
